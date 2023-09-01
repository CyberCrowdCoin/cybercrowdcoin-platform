const Sequelize = require('sequelize')
const xss = require('xss')
const Demand = require('../db/mysql/model/Demand')
const Protocol = require('../db/mysql/model/Protocol')
const { addToIpfs } = require('../db/ipfs/ipfs')
const { DemandStatusEnum, ProtocolStatusEnum } = require('../model/enum')

async function getList(creator = '', title = '', status = '', contract = '') {
    // 拼接查询条件
    const whereOpt = {}
    if (creator) whereOpt.creator = creator
    if (contract) whereOpt.contract = contract
    if (status) whereOpt.status = status
    if (title) whereOpt.title = {
        [Sequelize.Op.like]: `%${title}%` // 模糊查询
    }

    // 执行查询
    const list = await Demand.findAll({
        where: whereOpt,
        order: [
            ['id', 'desc'] // 排序
        ]
    })
    return list.map(item => item.dataValues)
}

async function getDetail(id) {
    const demand = await Demand.findOne({
        where: {
            id,
        }
    })
    if (demand == null) return null
    return demand.dataValues
}

async function newDemand(demandData = {}) {
    let contract = ''
    const title = xss(demandData.title)
    const creator = demandData.creator
    const category = xss(demandData.category)
    const description = xss(demandData.description)
    const status = DemandStatusEnum.OPEN
    const phone = xss(demandData.phone)
    const requiredSkill = xss(demandData.requiredSkill)
    const tokenAmount = xss(demandData.tokenAmount)
    const tokenAddress = ''

    // 创建MySQL记录
    const res = await Demand.create({
        contract,
        title,
        creator,
        category,
        description,
        status,
        phone,
        requiredSkill,
        tokenAmount,
        tokenAddress
    })

    const id = res.dataValues.id

    // 存储IPFS
    let meta = {
        id: id, title: title, creator: creator, category: category, description: description, status: status,
        phone: phone, requiredSkill: requiredSkill, tokenAmount: tokenAmount
    }
    let entity = JSON.stringify(meta)
    const ipfsurl = await addToIpfs(entity);
    console.info('ipfsurl ------->  ', ipfsurl)
    // 上链 todo

    // 更新demand表contract字段
    contract = 'test contract'
    await updateDemandContract(id, contract)
    return {
        id: id
    }
}

async function endDemand(id, creator = '') {
    const demandData = await getDetail(id)
    if (demandData == null || creator != demandData.creator || DemandStatusEnum.OPEN != demandData.status) {
        return false
    }
    // check demand下 无进行中的protocol
    const protocolList = await getProtocolList(id, null)
    if (protocolList) {
        for (const protocol of protocolList) {
            if (protocol.status == ProtocolStatusEnum.ACTIVE ||
                protocol.status == ProtocolStatusEnum.INVITE_PENDING ||
                protocol.status == ProtocolStatusEnum.PROPOSAL_PENDING)
                return false;
        }
    }
    // 调用合约end demand 退还押金 todo

    // 更新demand status
    await updateDemandStatus(id, creator, DemandStatusEnum.COMPLETED)
    return true
}

async function getProtocolList(demandId){

    const protocols = await Protocol.findAll({
        where: {
            demandId,
        }
    })
    return protocols
}

async function updateDemandContract(id, contract = '') {
    const res = await Demand.update(
        // 要更新的内容
        {
            contract,
        },
        // 条件
        {
            where: {
                id,
            }
        }
    )

    if (res[0] >= 1) return true
    return false
}

async function updateDemandStatus(id, creator = '', status = '') {
    const res = await Demand.update(
        // 要更新的内容
        {
            status,
        },
        // 条件
        {
            where: {
                id,
                creator
            }
        }
    )

    if (res[0] >= 1) return true
    return false
}


module.exports = {
    getList,
    getDetail,
    newDemand,
    endDemand,
    updateDemandContract,
    updateDemandStatus,
}
