const Sequelize = require('sequelize')
const Config = require('../db/mysql/model/Config')

async function getDetail(configKey) {
    const config = await Config.findOne({
        where: {
            configKey,
        }
    })
    if (config === null) return null
    return config.dataValues
}

async function addConfig(configKey, configVal) {

    await Config.upsert({
        configKey,
        configVal
    }, { where: { configKey } });

}

module.exports = {
    getDetail,
    addConfig
}