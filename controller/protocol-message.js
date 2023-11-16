const Sequelize = require('sequelize')
const xss = require('xss')
const ProtocolMessage = require('../db/mysql/model/ProtocolMessage')


async function getListByProtocolId(protocolId, page = 1, pageSize = 10) {
   // 拼接查询条件
   const whereOpt = {}
   if (protocolId) whereOpt.protocolId = protocolId

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 执行分页查询
    const result = await ProtocolMessage.findAndCountAll({
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
    const proposalMessage = await ProtocolMessage.findOne({
        where: {
            id,
        }
    })
    if (proposalMessage == null) return null
    return proposalMessage.dataValues
}


async function newProtocolMessage(creator, protocolId, type, content) {
    // 创建MySQL记录
    const res = await ProtocolMessage.create({
        type,
        protocolId,
        creator,
        content,
    })
    return {
        id: res.dataValues.id
    }
}

module.exports = {
    getListByProtocolId,
    getDetail,
    newProtocolMessage
}
