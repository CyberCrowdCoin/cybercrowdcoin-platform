const router = require('koa-router')()
const {
    getListByProtocolId, getDetail
} = require('../controller/protocol-message')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.prefix('/ccc/protocol-message')


router.get('/list-by-protocol', async function (ctx, next) {
    const page =  parseInt(ctx.query.page || 1)
    const pageSize = parseInt(ctx.query.pageSize || 10)
    const listData = await getListByProtocolId(ctx.query.protocolId, page, pageSize)
    ctx.body = new SuccessModel(listData)
})

router.get('/detail', async function (ctx, next) {
    const data = await getDetail(ctx.query.id);
    ctx.body = new SuccessModel(data)
})

module.exports = router
