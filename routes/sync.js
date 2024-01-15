const { syncCandidates,syncDemands } = require('../controller/sync')
const router = require('koa-router')()
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.prefix('/ccc/sync')

router.get('/sync-demand', async function (ctx, next) {
    
    await syncDemands()
    ctx.body = new SuccessModel()
})

router.get('/sync-candidate', async function (ctx, next) {
    
    await syncCandidates()
    ctx.body = new SuccessModel()
})

module.exports = router
