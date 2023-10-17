const router = require('koa-router')()
const {
    getList,
    getDetail,
    addDemandToIpfs,
    endDemandCheck
} = require('../controller/demand')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const tokenCheck = require('../middleware/tokenCheck')
const checkWhitelist = require('../middleware/whitelistCheck')

router.prefix('/ccc/demand')

router.get('/all-list', async function (ctx, next) {
    const title = ctx.query.title || ''
    const status = ctx.query.status || ''
    const category = ctx.query.category || ''
    const listData = await getList('', title, status, category)
    ctx.body = new SuccessModel(listData)
})

router.get('/employer-demand-list', tokenCheck, checkWhitelist, async function (ctx, next) {
    if (ctx.session.username == null) {
        console.error('is admin, but no login')
        // 未登录
        ctx.body = new ErrorModel('未登录')
        return
    }
    const creator =  ctx.session.username
    const title = ctx.query.title || ''
    const status = ctx.query.status || ''
    const contract = ctx.query.contract || ''
    const listData = await getList(creator, title, status, contract)
    ctx.body = new SuccessModel(listData)
})


router.get('/detail', async function (ctx, next) {
    const data = await getDetail(ctx.query.contract);
    ctx.body = new SuccessModel(data)
})

router.post('/add-ipfs', tokenCheck, checkWhitelist, async function (ctx, next) {
    const body = ctx.request.body
    body.creator = ctx.session.username
    const data = await addDemandToIpfs(body)
    ctx.body = new SuccessModel(data)

})

router.get('/endDemandCheck', tokenCheck, checkWhitelist, async function (ctx, next) {
    const creator = ctx.session.username
    const contract = ctx.query.contract
    const val = await endDemandCheck(contract, creator)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('end demand check failed')
    }
})


module.exports = router
