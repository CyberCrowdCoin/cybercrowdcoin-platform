const Sequelize = require('sequelize')
const xss = require('xss')
const Protocol = require('../db/mysql/model/Protocol')
const { addToIpfs } = require('../db/ipfs/ipfs')
const { ProtocolStatusEnum, ProtocolMessageTypeEnum, DemandStatusEnum } = require('../model/enum')
const candidate = require('./candidate')
const demand = require('./demand')
const proposalMessage = require('./protocol-message')
const { SuccessModel, ErrorModel } = require('../model/resModel')

async function getList(contract, candidate) {
    // 拼接查询条件
    const whereOpt = {}
    if (contract) whereOpt.contract = contract
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

async function getPageList(contract = '', candidate = '', page = 1, pageSize = 10) {
    // 拼接查询条件
    // 拼接查询条件
    const whereOpt = {}
    if (contract) whereOpt.contract = contract
    if (candidate) whereOpt.candidate = candidate

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 执行分页查询
    const result = await Protocol.findAndCountAll({
        where: whereOpt,
        order: [['id', 'desc']], // 排序
        offset: offset, // 偏移量
        limit: Number(pageSize) // 每页数量
    });

    const list = result.rows.map(item => item.dataValues);
    const totalItems = result.count;

    return {
        list: list,
        total: totalItems
    };
}

async function getDetail(id) {
    const protocol = await Protocol.findOne({
        where: {
            id,
        }
    })
    if (protocol !== null) {
        // 找到了数据
        return protocol.dataValues;
    } else {
        // 没有找到数据
        return null;
    }
}

// 登录账号为employer才能操作
async function sendInvitation(protocolData = {}) {
    const contract = protocolData.contract
    const candidateAddress = protocolData.candidate
    const demandData = await demand.getDetail(contract)
    const candidateData = await candidate.getDetail(candidateAddress)
    // 逻辑校验
    const checkResult = await newProtocolCheck(demandData, candidateData);
    if (!checkResult.success) {
        return checkResult;
    }
    const employer = protocolData.employer
    // 上传IPFS
    // const ipfsurl = await addProtocolToIpfs(demandData.contract, employer, candidateData.user);
    // console.info('sendInvitation ipfsurl---->', ipfsurl)    
    // 入protocol表
    const id = await newProtocol(contract, ProtocolStatusEnum.INVITE_PENDING, employer, candidateAddress)
    // 增加一个invitation类型消息
    await proposalMessage.newProtocolMessage(employer, id, ProtocolMessageTypeEnum.INVITATION_SEND, '')
    return new SuccessModel('send invite success');
}

// 登录账号为candidate操作
// 创建demand protocol表数据 -> 增加一个proposal类型消息并更新demand protocl 表 proposal-message-id
async function sendProposal(protocolData = {}) {
    const contract = protocolData.contract
    const candidateAddress = protocolData.candidate
    const demandData = await demand.getDetail(contract)
    const candidateData = await candidate.getDetail(candidateAddress)
    const checkResult = await newProtocolCheck(demandData, candidateData);
    if (!checkResult.success) {
        return checkResult
    }
    const employer = demandData.creator
    // 入protocol表
    const id = await newProtocol(contract, ProtocolStatusEnum.PROPOSAL_PENDING, employer, candidateAddress)
    // 增加一个proposal类型消息
    await proposalMessage.newProtocolMessage(candidateAddress, id, ProtocolMessageTypeEnum.PROPOSAL_SEND, '')
    return new SuccessModel('send proposal success')
}

async function newProtocolCheck(demandData, candidateData) {
    if (demandData == null || candidateData == null) {
        return new ErrorModel('demand or candidate is null');
    }
    if (demandData.status != DemandStatusEnum.OPEN) {
        return new ErrorModel('demand status is not open');
    }
    // 当前demand下没有有效的protocol数据
    const protocols = await getList(demandData.contract, null)
    if (protocols) {
        for (const protocol of protocols) {
            if (protocol.status == ProtocolStatusEnum.ACTIVE ||
                protocol.status == ProtocolStatusEnum.FINISHED ||
                protocol.status == ProtocolStatusEnum.INVITE_PENDING ||
                protocol.status == ProtocolStatusEnum.PROPOSAL_PENDING || 
                protocol.status == ProtocolStatusEnum.ACTIVE_PENDING) {
                return new ErrorModel('demand has valid protocol');;
            }
        }
    }
    return new SuccessModel();
}

async function addProtocolToIpfs(contract, employer, candidate) {
    let meta = { demandAddress: contract, employer: employer, candidate: candidate }
    let entity = JSON.stringify(meta)
    const ipfsurl = await addToIpfs(entity);
    return ipfsurl
}

async function newProtocol(contract, status, employer, candidate) {
    const activeDate = null
    // 入protocol表
    const res = await Protocol.create({
        contract,
        status,
        employer,
        candidate,
        activeDate,
    })
    return res.dataValues.id
}

// 登录账户为candidate才能操作
// 发送accept-invitation类型消息并更新demand protocl 表  如status=active,active_date
async function acceptInvitation(candidateAddress, protocolId) {
    const protocolData = await getDetail(protocolId)
    if (protocolData == null) {
        console.error('acceptInvitation failed, protocol null', candidateAddress, protocolId)
        return new ErrorModel('accept invite failed, protocol is null');
    }
    const candidateData = await candidate.getDetail(protocolData.candidate)
    if (candidateAddress != candidateData.user || ProtocolStatusEnum.INVITE_PENDING != protocolData.status) {
        console.error('acceptInvitation failed, protocol is not right', candidateAddress, protocolId)
        return new ErrorModel('accept invite failed, protocol is not right');
    }
    // 更新protocol表
    // await updateProtocolActive(protocolId)
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.PROPOSAL_PENDING);
    // 发送accept-invitation消息
    await proposalMessage.newProtocolMessage(candidateAddress, protocolId, ProtocolMessageTypeEnum.INVITATION_ACCEPT, '')
    await proposalMessage.newProtocolMessage(candidateAddress, protocolId, ProtocolMessageTypeEnum.PROPOSAL_SEND, '')
    return new SuccessModel('accept invite success')
}

// 登录用户为candidate才能操作
// 更新protocol表 status=INVITE_REFUSED 
// 发送refuse-invitation message
async function refuseInvitation(candidateAddress, protocolId) {
    const protocolData = await getDetail(protocolId)
    if (protocolData == null) {
        console.error('refuseInvitation failed, protocol null', candidateAddress, protocolId)
        return new ErrorModel('refuse invite failed, protocol is null')
    }
    const candidateData = await candidate.getDetail(protocolData.candidate)
    if (candidateAddress != candidateData.user || ProtocolStatusEnum.INVITE_PENDING != protocolData.status) {
        console.error('refuseInvitation failed, protocol is not right', candidateAddress, protocolId)
        return new ErrorModel('refuse invite failed, protocol is not right')
    }
    // 更新protocol表
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.INVITE_REFUSED)
    // 发送refuse-invitation消息 
    await proposalMessage.newProtocolMessage(candidateAddress, protocolId, ProtocolMessageTypeEnum.INVITATION_REFUSED, '')
    return new SuccessModel('refuse invite success')
}

// accept-proposal(接收candidate发起的提议)
// demand protocol信息存入ipfs 
// -> 调用demand合约add-candidate 改为前端调用
// -> 增加一个accept-proposal类型message 
// -> 更新demand protocl 表  如status=active,candidate,active_date
async function acceptProposal(employer, protocolId) {
    const protocolData = await getDetail(protocolId)
    if (protocolData == null) {
        console.error('acceptProposal failed, protocol is null', employer, protocolId)
        return new ErrorModel('accept proposal failed, protocol is null')
    }
    if (employer != protocolData.employer || ProtocolStatusEnum.PROPOSAL_PENDING != protocolData.status) {
        console.error('acceptProposal failed, protocol is not right', employer, protocolId)
        return new ErrorModel('accept proposal failed, protocol is not right')
    }
    const demandData = await demand.getDetail(protocolData.contract)
    const candidateData = await candidate.getDetail(protocolData.candidate)
    try {
        // 上传IPFS
        const ipfsurl = await addProtocolToIpfs(demandData.contract, employer, candidateData.user)
        return new SuccessModel({url : ipfsurl})
        // 上链 ToDo
        // await addCandidateContract(demandData.contract, employer, candidateData.user, ipfsurl);
        // // 更新protocol表
        // await updateProtocolActive(protocolId)
        // // 发送accept-proposal消息 todo
        // await proposalMessage.newProtocolMessage(employer, protocolId, ProtocolMessageTypeEnum.PROPOSAL_ACCETP, '')
        // return true
    } catch (error) {
        console.error("accept proposal error", error)
    }
    return new ErrorModel('accept proposal failed, add protocol to ipfs error')
    ;
}

// 登录用户为employer才能操作
// 更新protocol 表状态
// 发送message
async function refuseProposal(employer, protocolId) {
    const protocolData = await getDetail(protocolId)
    if (protocolData == null) {
        console.error('refuseProposal failed, protocol is null', employer, protocolId)
        return new ErrorModel('refuse proposal failed, protocol is null')
    }
    
    if (employer != protocolData.employer || ProtocolStatusEnum.PROPOSAL_PENDING != protocolData.status) {
        console.error('refuseProposal failed, protocol is not right', employer, protocolId)
        return new ErrorModel('refuse proposal failed, protocol is not right')
    }
    // 更新protocol表
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.PROPOSAL_REFUSED)
    // 发送refuse-proposal消息
    await proposalMessage.newProtocolMessage(employer, protocolId, ProtocolMessageTypeEnum.PROPOSAL_REFUSED, '')

    return new SuccessModel('refuse proposal success')
}

// 登录用户为employer才能操作
// 更新protocol 表状态
// 发送message
async function cancelInvitation(employer, protocolId) {
    const protocolData = await getDetail(protocolId)
    if (protocolData == null) {
        console.error('cancelInvitation failed, protocol is null', employer, protocolId)
        return new ErrorModel('cancel invite failed, protocol is null')
    }
    if (employer != protocolData.employer || ProtocolStatusEnum.INVITE_PENDING != protocolData.status) {
        console.error('cancelInvitation failed, protocol is not right', employer, protocolId)
        return new ErrorModel('cancel invite failed, protocol is not right')
    }
    // 更新protocol表
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.INVITE_CANCEL)
    // 发送cancel-invitation消息 todo
    await proposalMessage.newProtocolMessage(employer, protocolId, ProtocolMessageTypeEnum.INVITATION_CANCEL, '')
    return new SuccessModel('cancel invite success')
}

// 登录用户为candidate才能操作
// 更新protocol表 status=finished
// 发送finish-protocol message
async function finishProtocol(candidateAddress, protocolId) {
    const protocolData = await getDetail(protocolId)
    if (protocolData == null) {
        console.error('finishProtocol failed, protocol null', candidateAddress, protocolId)
        return new ErrorModel('finish protocol failed, protocol is null')
    }
    const candidateData = await candidate.getDetail(protocolData.candidate)
    if (candidateAddress != candidateData.user || ProtocolStatusEnum.ACTIVE != protocolData.status) {
        console.error('finishProtocol failed, protocol is not right', candidateAddress, protocolId)
        return new ErrorModel('finish protocol failed, protocol is is not right')
    }
    // 更新protocol表
    await updateProtocolStatus(protocolId, ProtocolStatusEnum.FINISHED)
    // 发送finish-protocol消息 todo
    await proposalMessage.newProtocolMessage(candidateAddress, protocolId, ProtocolMessageTypeEnum.PROTOCOL_FINISH, '')

    return new SuccessModel('finish protocol success')
}

async function updateProtocolStatus(id, status) {
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

async function updateProtocolActive(id) {
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
    updateProtocolActive,
    updateProtocolStatus,
    getPageList
}
