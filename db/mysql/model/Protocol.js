const Sequelize = require('sequelize')
const seq = require('../seq')

const Protocol = seq.define(
    'protocol', // 对应数据库的 protocols 表（英文复数）
    {
        /* 不用定义 id ，seq 会自动增加 */

        contract: {
            type: Sequelize.STRING,
            allowNUll: false,
            field: 'contract',
            comment: 'contract id'
        },

        status: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        employer: {
            type: Sequelize.STRING,
            allowNUll: false,
            comment: '雇主'
        },

        candidate: {
            type: Sequelize.STRING,
            allowNUll: false,
            comment: 'candidate'
        },

        activeDate: {
            type: Sequelize.BIGINT,
            allowNUll: false
        },

        /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
    }
)

module.exports = Protocol
