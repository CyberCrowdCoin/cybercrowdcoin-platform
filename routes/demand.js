const router = require('koa-router')()
const {
    getList,
    getDetail,
    newDemand,
    updateDemandStatus
} = require('../controller/demand')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { DemandStatusEnum } = require('../model/enum')
const tokenCheck = require('../middleware/tokenCheck')

router.prefix('/ccc/demand')

router.get('/all-list', async function (ctx, next) {
    const creator = ctx.query.creator || ''
    const title = ctx.query.title || ''
    const status = ctx.query.status || ''
    const contract = ctx.query.contract || ''
    const listData = await getList(creator, title, status, contract)
    ctx.body = new SuccessModel(listData)
})

router.get('/employer-demand-list', tokenCheck, async function (ctx, next) {
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
    const data = await getDetail(ctx.query.id);
    ctx.body = new SuccessModel(data)
})

router.post('/new', tokenCheck, async function (ctx, next) {
    const body = ctx.request.body
    body.creator = ctx.session.username
    const data = await newDemand(body)
    ctx.body = new SuccessModel(data)

})

router.post('/end', tokenCheck, async function (ctx, next) {
    const val = await updateDemandStatus(ctx.query.id, creator, DemandStatusEnum.COMPLETED)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('end demand failed')
    }
})

router.post('/cancel', tokenCheck, async function (ctx, next) {
    const val = await updateDemandStatus(ctx.query.id, creator, DemandStatusEnum.CANCEL)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('cancel demand failed')
    }
})


module.exports = router
