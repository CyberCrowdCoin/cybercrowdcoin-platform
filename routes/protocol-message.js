const router = require('koa-router')()
const {
    getListByProtocolId, getDetail
} = require('../controller/protocol-message')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.prefix('/ccc/protocol-message')


router.get('/list-by-protocol', async function (ctx, next) {
    const listData = await getListByProtocolId(ctx.query.protocolId, null)
    ctx.body = new SuccessModel(listData)
})

router.get('/detail', async function (ctx, next) {
    const data = await getDetail(ctx.query.id);
    ctx.body = new SuccessModel(data)
})

module.exports = router
