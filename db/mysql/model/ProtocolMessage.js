const Sequelize = require('sequelize')
const seq = require('../seq')

const ProtocolMessage = seq.define(
    'protocol', // 对应数据库的 protocols 表（英文复数）
    {
        /* 不用定义 id ，seq 会自动增加 */

        type: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        protocolId: {
            type: Sequelize.BIGINT,
            allowNUll: false,
            field: 'protocol_id',
        },

        creator: {
            type: Sequelize.STRING,
            allowNUll: false,
            comment: 'creator'
        },
        
        content: {
            type: Sequelize.TEXT,
            allowNUll: true
        },
        /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
    }
)

module.exports = ProtocolMessage
