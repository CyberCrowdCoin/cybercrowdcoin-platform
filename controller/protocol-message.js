const Sequelize = require('sequelize')
const xss = require('xss')
const ProtocolMessage = require('../db/mysql/model/ProtocolMessage')


async function getListByProtocolId(protocolId) {
    // 拼接查询条件
    const whereOpt = {}
    if (protocolId) whereOpt.protocolId = protocolId

    // 执行查询
    const list = await ProtocolMessage.findAll({
        where: whereOpt,
        order: [
            ['id', 'desc'] // 排序
        ]
    })
    return list.map(item => item.dataValues)
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
