const Sequelize = require('sequelize')
const seq = require('../seq')

const Candidate = seq.define(
    'candidate', // 对应数据库的 candidates 表（英文复数）
    {
        /* 不用定义 id ，seq 会自动增加 */

        user: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        status: {
            type: Sequelize.STRING, // TEXT 可存储大文件
            allowNUll: false
        },

        qualification: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        gender: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        age: {
            type: Sequelize.INTEGER,
            allowNUll: false
        }

        /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
    }
)

module.exports = Candidate
