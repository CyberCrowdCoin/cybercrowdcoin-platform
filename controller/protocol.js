const Sequelize = require('sequelize')
const xss = require('xss')
const Protocol = require('../db/mysql/model/Protocol')
const {addToIpfs} = require('../db/ipfs/ipfs')
const { ProtocolStatusEnum, ProtocolMessageTypeEnum, DemandStatusEnum } = require('../model/enum')
const candidate = require('./candidate')
const demand = require('./demand')
const proposalMessage = require('./protocol-message')
const addCandidateContract = require('./contract')
async function getList(demandId, candidate) {
    // 拼接查询条件
    const whereOpt = {}
    if (demandId) whereOpt.demandId = demandId
    if (candidate) whereOpt.candidate = candidate

    // 执行查询
    const list = await Protocol.findAll({
        where: whereOpt,
        order: [
            ['id', 'desc'] // 排序
        ]
    })
    return list.map(item => item.dataValues)
}

async function getDetail(id) {
    const protocol = await Protocol.findOne({
        where: {
            id,
        }
    })
    if (protocol == null) return null
    return protocol.dataValues
}

// 登录账号为employer才能操作
async function sendInvitation(protocolData = {}) {
    const demandId = protocolData.demandId
    const candidate = protocolData.candidate
    const demandData = await demand.getDetail(demandId)
    const candidateData = await candidate.getDetail(candidate)
    // 逻辑校验
    const checkResult = await newProtocolCheck(demandData, candidateData);
    if(!checkResult){
        return null
    }
    const employer = protocolData.employer
    // 上传IPFS
    // const ipfsurl = await addProtocolToIpfs(demandData.contract, employer, candidateData.user);
    // console.info('sendInvitation ipfsurl---->', ipfsurl)    
    // 入protocol表
    const id = await newProtocol(demandId, ProtocolStatusEnum.INVITE_PENDING, employer, candidate)
    // 增加一个invitation类型消息
    await proposalMessage.newProtocolMessage(employer, id, ProtocolMessageTypeEnum.INVITATION_SEND, '')
    return {
        id: id
    }
}

// 登录账号为candidate操作
// 创建demand protocol表数据 -> 增加一个proposal类型消息并更新demand protocl 表 proposal-message-id
async function sendProposal(protocolData = {}) {
    const demandId = protocolData.demandId
    const candidate = protocolData.candidate
    const demandData = await demand.getDetail(demandId)
    const candidateData = await candidate.getDetail(candidate)
    const checkResult = await newProtocolCheck(demandData, candidateData);
    if(!checkResult){
        return null
    }
    const employer = demandData.creator
    // 入protocol表
    const id = await newProtocol(demandId, ProtocolStatusEnum.PROPOSAL_PENDING, employer, candidate)
    // 增加一个proposal类型消息
    await proposalMessage.newProtocolMessage(candidate, id, ProtocolMessageTypeEnum.PROPOSAL_SEND, '')
    return {
        id: id
    }
}

async function newProtocolCheck(demandData, candidateData){
    if(demandData == null || candidateData == null) {
        return false
    }
    if(demandData.status != DemandStatusEnum.OPEN){
        return false
    }
    // 当前demand下没有有效的protocol数据
    const protocols = await getList(demandData.id, null)
    if(protocols){
        for(const protocol of protocols){
            if(protocol.status == ProtocolStatusEnum.ACTIVE || 
                protocol.status == ProtocolStatusEnum.FINISHED ||
                protocol.status == ProtocolStatusEnum.INVITE_PENDING || 
                protocol.status == ProtocolStatusEnum.PROPOSAL_PENDING ){
                    return false;
                }
        }
    }
    return true
}

async function addProtocolToIpfs(contract, employer, candidate){
    let meta = { demandAddress:contract, employer: employer, candidate: candidate}
    let entity = JSON.stringify(meta)
    const ipfsurl = await addToIpfs(entity);
    return ipfsurl
}

async function newProtocol(demandId, status, employer, candidate){
    const activeDate = null
    // 入protocol表
    const res = await Protocol.create({
        demandId,
        status,
        employer,
        candidate,
        activeDate,
    })
    return res.dataValues.id
}

// 登录账户为candidate才能操作
// 发送accept-invitation类型消息并更新demand protocl 表  如status=active,active_date
async function acceptInvitation(candidate, protocolId){
    const protocolData = await getDetail(protocolId)
    if(protocolData == null){
        console.error('acceptInvitation failed, protocol null', candidate, protocolId)
        return false
    }
    const candidateData = await candidate.getDetail(protocolData.candidate)
    if(candidate != candidateData.user || ProtocolStatusEnum.INVITE_PENDING != protocolData.status){
        console.error('acceptInvitation failed, protocol is not right', candidate, protocolId)
        return false
    }
    // 更新protocol表
    // await updateProtocolActive(protocolId)
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.PROPOSAL_PENDING);
    // 发送accept-invitation消息
    await proposalMessage.newProtocolMessage(candidate, protocolId, ProtocolMessageTypeEnum.INVITATION_ACCEPT, '')
    await proposalMessage.newProtocolMessage(candidate, protocolId, ProtocolMessageTypeEnum.PROPOSAL_SEND, '')

    return true
}

// 登录用户为candidate才能操作
// 更新protocol表 status=INVITE_REFUSED 
// 发送refuse-invitation message
async function refuseInvitation(candidate , protocolId){
    const protocolData = await getDetail(protocolId)
    if(protocolData == null){
        console.error('refuseInvitation failed, protocol null', candidate, protocolId)
        return false
    }
    const candidateData = await candidate.getDetail(protocolData.candidate)
    if(candidate != candidateData.user || ProtocolStatusEnum.INVITE_PENDING != protocolData.status){
        console.error('refuseInvitation failed, protocol is not right', candidate, protocolId)
        return false
    }
    // 更新protocol表
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.INVITE_REFUSED)
    // 发送refuse-invitation消息 
    await proposalMessage.newProtocolMessage(candidate, protocolId, ProtocolMessageTypeEnum.INVITATION_REFUSED, '')
    return true
}

// accept-proposal(接收candidate发起的提议)
// demand protocol信息存入ipfs 
// -> 调用demand合约add-candidate 上链  
// -> 增加一个accept-proposal类型message 
// -> 更新demand protocl 表  如status=active,candidate,active_date
async function acceptProposal(employer, protocolId){
    const protocolData =  await getDetail(protocolId)
    if(protocolData == null){
        console.error('acceptProposal failed, protocol is null', employer, protocolId)
        return false
    }
    if(employer != protocolData.employer || ProtocolStatusEnum.PROPOSAL_PENDING != protocolData.status){
        console.error('acceptProposal failed, protocol is not right', employer, protocolId)
        return false
    }
    const demandData = await demand.getDetail(protocolData.demandId)
    const candidateData = await candidate.getDetail(protocolData.candidate)
    // 上传IPFS
    const ipfsurl = await addProtocolToIpfs(demandData.contract, employer, candidateData.user)
    // 上链 ToDo
    await addCandidateContract(demandData.contract, employer, candidateData.user, ipfsurl);
    // 更新protocol表
    await updateProtocolActive(protocolId)
    // 发送accept-proposal消息 todo
    await proposalMessage.newProtocolMessage(employer, protocolId, ProtocolMessageTypeEnum.PROPOSAL_ACCETP, '')
    return true
}

// 登录用户为employer才能操作
// 更新protocol 表状态
// 发送message
async function refuseProposal(employer, protocolId){
    const protocolData =  await getDetail(protocolId)
    if(protocolData == null){
        console.error('refuseProposal failed, protocol is null', employer, protocolId)
        return false
    }
    if(employer != protocolData.employer || ProtocolStatusEnum.PROPOSAL_PENDING != protocolData.status){
        console.error('refuseProposal failed, protocol is not right', employer, protocolId)
        return false
    }
    // 更新protocol表
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.PROPOSAL_REFUSED)
    // 发送refuse-proposal消息
    await proposalMessage.newProtocolMessage(employer, protocolId, ProtocolMessageTypeEnum.PROPOSAL_REFUSED, '')

    return true
}

// 登录用户为employer才能操作
// 更新protocol 表状态
// 发送message
async function cancelInvitation(employer, protocolId){
    const protocolData =  await getDetail(protocolId)
    if(protocolData == null){
        console.error('cancelInvitation failed, protocol is null', employer, protocolId)
        return false
    }
    if(employer != protocolData.employer || ProtocolStatusEnum.INVITE_PENDING != protocolData.status){
        console.error('cancelInvitation failed, protocol is not right', employer, protocolId)
        return false
    }
    // 更新protocol表
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.INVITE_CANCEL)
    // 发送cancel-invitation消息 todo
    await proposalMessage.newProtocolMessage(employer, protocolId, ProtocolMessageTypeEnum.INVITATION_CANCEL, '')
    return true
}

// 登录用户为candidate才能操作
// 更新protocol表 status=finished
// 发送finish-protocol message
async function finishProtocol(candidate, protocolId){
    const protocolData = await getDetail(protocolId)
    if(protocolData == null){
        console.error('finishProtocol failed, protocol null', candidate, protocolId)
        return false
    }
    const candidateData = await candidate.getDetail(protocolData.candidate)
    if(candidate != candidateData.user || ProtocolStatusEnum.ACTIVE != protocolData.status){
        console.error('finishProtocol failed, protocol is not right', candidateAddress, protocolId)
        return false
    }
    // 更新protocol表
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.FINISHED)
    // 发送finish-protocol消息 todo
    await proposalMessage.newProtocolMessage(candidate, protocolId, ProtocolMessageTypeEnum.PROTOCOL_FINISH, '')

    return true
}

async function updateProtocolStatus(id, status){
    const res = await Protocol.update(
        // 要更新的内容
        {
            status,
        },
        // 条件
        {
            where: {
                id
            }
        }
    )

    if (res[0] >= 1) return true
    return false
}

async function updateProtocolActive(id){
    const status = ProtocolStatusEnum.ACTIVE
    const activeDate = Date.now()
    const res = await Protocol.update(
        // 要更新的内容
        {
            status,
            activeDate
        },
        // 条件
        {
            where: {
                id
            }
        }
    )

    if (res[0] >= 1) return true
    return false
}



module.exports = {
    getList,
    getDetail,
    sendInvitation,
    sendProposal,
    acceptInvitation,
    refuseInvitation,
    acceptProposal,
    refuseProposal,
    finishProtocol,
    cancelInvitation,
}
