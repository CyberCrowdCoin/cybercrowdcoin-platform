const WhitelistUser = require('../db/mysql/model/WhitelistUser')

// 存储白名单数据的本地缓存
let whitelistCache = [];

async function checkWhitelist(address = ''){
    const isWhitelisted = whitelistCache.some(entry => entry.address === address);

    if (isWhitelisted) {
      return true;
    } else {
      return false;
    }
}

async function getList() {
    // 执行查询
    const list = await WhitelistUser.findAll({
        order: [
            ['id', 'desc'] // 排序
        ]
    })
    return list.map(item => item.dataValues)
}

// 获取白名单数据并存储在本地缓存中
async function populateWhitelistCache() {
    try {
      whitelistCache = await getList();
      // console.log('Whitelist cache populated', whitelistCache);
    } catch (error) {
      console.error('Error populating whitelist cache', error);
    }
}

// 启动服务器前，从数据库加载白名单数据到本地缓存
populateWhitelistCache();

module.exports = {
    checkWhitelist
}