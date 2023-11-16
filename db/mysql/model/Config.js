const Sequelize = require('sequelize')
const seq = require('../seq')

const Config = seq.define(
    'config', // 对应数据库的 config 表（英文复数）
    {
        /* 不用定义 id ，seq 会自动增加 */

        configKey: {
            allowNull: false,
            type: Sequelize.STRING,
            field: 'config_key',
            unique: true
        },

        configVal: {
            allowNull: false,
            type: Sequelize.STRING,
            field:'config_val'
        }

        /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
    }
)

module.exports = Config
