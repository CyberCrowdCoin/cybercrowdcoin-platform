const Sequelize = require('sequelize')
const seq = require('../seq')

const User = seq.define(
    'user', // 对应数据库的 users 表（英文复数）
    {
        /* 不用定义 id ，seq 会自动增加 */

        address: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },

        nonce: {
            allowNull: false,
            type: Sequelize.INTEGER.UNSIGNED,
            defaultValue: () => Math.floor(Math.random() * 1000000) // Initialize with a random nonce

        }

        /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
    }
)

module.exports = User
