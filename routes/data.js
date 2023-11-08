const router = require('koa-router')()
const {
    getHomePageData
} = require('../controller/data')

router.prefix('/ccc/data')

router.get('/homepage-list', async function (ctx, next) {
    const listData = await getHomePageData()
    ctx.body = listData
})

module.exports = router

