const Sequelize = require('sequelize')
const xss = require('xss')
const Demand = require('../db/mysql/model/Demand')
const Protocol = require('../db/mysql/model/Protocol')
const { addToIpfs } = require('../db/ipfs/ipfs')
const { DemandStatusEnum, ProtocolStatusEnum } = require('../model/enum')
const { SuccessModel, ErrorModel } = require('../model/resModel')


async function getList(creator = '', title = '', status = '', category = '') {
    // 拼接查询条件
    const whereOpt = {}
    if (category) whereOpt.category = category
    if (creator) whereOpt.creator = creator
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

async function getPageList(creator = '', title = '', status = '', category = '', page = 1, pageSize = 10) {
    // 拼接查询条件
    const whereOpt = {}
    if (category) whereOpt.category = category
    if (creator) whereOpt.creator = creator
    if (status) whereOpt.status = status
    if (title) whereOpt.title = {
        [Sequelize.Op.like]: `%${title}%` // 模糊查询
    }

    console.info("pageSize=", pageSize)
    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 执行分页查询
    const result = await Demand.findAndCountAll({
        where: whereOpt,
        order: [['id', 'desc']], // 排序
        offset: offset, // 偏移量
        limit: pageSize // 每页数量
    });

    const list = result.rows.map(item => item.dataValues);
    const totalItems = result.count;

    return {
        list: list,
        total: totalItems
    };
}


async function getDetail(contract) {
    const demand = await Demand.findOne({
        where: {
            contract,
        }
    })
    if (demand !== null) {
        // 找到了数据
        return demand.dataValues;
    } else {
        // 没有找到数据
        return null;
    }
}

async function addDemandToIpfs(demandData = {}) {
    const title = xss(demandData.title)
    const creator = demandData.creator
    const category = xss(demandData.category)
    const description = xss(demandData.description)
    const status = DemandStatusEnum.OPEN
    const phone = xss(demandData.phone)
    const budget = xss(demandData.budget)
    const tokenAmount = xss(demandData.tokenAmount)
    // 存储IPFS
    let meta = {
        title: title, creator: creator, category: category, description: description, status: status,
        phone: phone, budget: budget, tokenAmount: tokenAmount
    }
    let entity = JSON.stringify(meta)
    const ipfsurl = await addToIpfs(entity);
    return {
        url: ipfsurl
    }
}

async function addDemand(demandData = {}) {
    const title = demandData.title
    const creator = demandData.creator
    const category = demandData.category
    const description = demandData.description
    const status = DemandStatusEnum.OPEN
    const phone = demandData.phone
    const budget = demandData.budget
    const tokenAmount = demandData.tokenAmount
    const tokenAddress = ''
    const requiredSkill = ''
    const contract = demandData.contract
    // 创建MySQL记录
    Demand.create({
        contract,
        title,
        creator,
        category,
        description,
        status,
        phone,
        requiredSkill,
        tokenAmount,
        tokenAddress,
        budget,
    })

}

async function endDemandCheck(contract = '', creator = ''){
    const demandData = await getDetail(contract)
    if (demandData == null || creator != demandData.creator || DemandStatusEnum.ONGOING != demandData.status) {
        return new ErrorModel('demand data is null or status is not ongoing');
    }
    // check demand下 无进行中的protocol
    const protocolList = await getProtocolList(contract, null)
    if (protocolList) {
        for (const protocol of protocolList) {
            if (protocol.status == ProtocolStatusEnum.ACTIVE ||
                protocol.status == ProtocolStatusEnum.INVITE_PENDING ||
                protocol.status == ProtocolStatusEnum.PROPOSAL_PENDING)
                return new ErrorModel('demand has active or pending protocol');
        }
    }
    return new SuccessModel('end demand success');
}


async function getProtocolList(contract) {

    const protocols = await Protocol.findAll({
        where: {
            contract,
        }
    })
    return protocols
}

async function updateDemandContract(transHash, contract = '') {
    const res = await Demand.update(
        // 要更新的内容
        {
            contract,
        },
        // 条件
        {
            where: {
                transHash,
            }
        }
    )

    if (res[0] >= 1) return true
    return false
}

async function updateDemandStatus(contract = '', status = '') {
    const res = await Demand.update(
        // 要更新的内容
        {
            status,
        },
        // 条件
        {
            where: {
                contract
            }
        }
    )

    if (res[0] >= 1) return true
    return false
}


module.exports = {
    getList,
    getDetail,
    addDemand,
    updateDemandContract,
    updateDemandStatus,
    addDemandToIpfs,
    endDemandCheck,
    getPageList,
}
