const Sequelize = require('sequelize')
const seq = require('../seq')

const Demand = seq.define(
    'demand', // 对应数据库的 demands 表（英文复数）
    {
        /* 不用定义 id ，seq 会自动增加 */

        contract: {
            type: Sequelize.STRING,
            allowNUll: false,
            defaultValue:' ',
            comment: 'demand合约地址'
        },

        title: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        creator: {
            type: Sequelize.STRING,
            allowNUll: false,
            comment: '操作人账户'
        },

        category: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        description: {
            type: Sequelize.TEXT, // TEXT 可存储大文件
            allowNUll: false
        },

        status: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        phone: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        requiredSkill: {
            field: 'required_skill',
            type: Sequelize.STRING,
            allowNUll: true
        },

        tokenAmount: {
            field: 'token_amount',
            type: Sequelize.BIGINT,
            allowNUll: false
        },

        tokenAddress: {
            field: 'token_address',
            type: Sequelize.STRING,
            allowNUll: true
        }

        /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
    }
)

module.exports = Demand
