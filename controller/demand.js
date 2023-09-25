const Sequelize = require('sequelize')
const xss = require('xss')
const Demand = require('../db/mysql/model/Demand')
const Protocol = require('../db/mysql/model/Protocol')
const { addToIpfs, getFromIpfs } = require('../db/ipfs/ipfs')
const { DemandStatusEnum, ProtocolStatusEnum } = require('../model/enum')
const { endDemandContract } = require('./contract')
const contract = require('./contract'); // 导入合约对象
const ethers = require('ethers');



contract.contract.events.DemandCreated({
    fromBlock: 0,
    toBlock: 'latest'
}, function (error, event) { })
    .on('data', function (event) {
        // 根据contract查找记录
        // console.log("hash: " + event.transactionHash +"     DemandCreated: " +event.returnValues.newDemand, 
        // + "     creator: " + event.returnValues.creator); // same results as the optional callback above

        const contract = event.returnValues.newDemand;
        const ipfsData = event.returnValues.ipfsData;
        const creator = event.returnValues.creator;
        const demandData = getByContract(contract);
        if (contract && demandData == null) {
            // 插入
            console.log("step here")
            try {
                // 使用 ethers.utils.hexDataSlice 将字节字符串还原为字节数组
                const demandBytesArray = ethers.utils.arrayify(ipfsData);

                // 使用 Buffer.from 将字节数组转换为 JSON 字符串
                const jsonString = Buffer.from(demandBytesArray).toString('utf8');

                // 使用 JSON.parse 将 JSON 字符串解析为对象
                const demand = JSON.parse(jsonString);
                demand.creator = creator;
                demand.contract = contract;
                // console.info("demandJson=    ", demand)
                newDemand(demand);
            } catch (error) {
                console.error(error)
            }


        }
    })

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

async function getDetail(id) {
    const demand = await Demand.findOne({
        where: {
            id,
        }
    })
    if (demand == null) return null
    return demand.dataValues
}

function getByContract(contract) {
    const demand = Demand.findOne({
        where: {
            contract,
        }
    })
    if (demand == null) return null
    return demand.dataValues
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

function newDemand(demandData = {}) {
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
    // 调用合约end demand 退还押金
    await endDemandContract(demandData.contract, creator, demandData.tokenAmount)
    // 更新demand status
    await updateDemandStatus(id, creator, DemandStatusEnum.COMPLETED)
    return true
}

async function getProtocolList(demandId) {

    const protocols = await Protocol.findAll({
        where: {
            demandId,
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
    addDemandToIpfs,
}
