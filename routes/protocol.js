const router = require('koa-router')()
const {
    getDetailByUser,
} = require('../controller/candidate')
const {
    getList,
    getDetail,
    sendInvitation,
    sendProposal,
    acceptInvitation,
    refuseInvitation,
    acceptProposal,
    refuseProposal,
    finishProtocol,
    cancelInvitation,
    updateProtocolStatus,
    getPageList
} = require('../controller/protocol')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { ProtocolStatusEnum } = require('../model/enum')
const tokenCheck = require('../middleware/tokenCheck')
const checkWhitelist = require('../middleware/whitelistCheck')

router.prefix('/ccc/protocol')


router.get('/list-by-demand', async function (ctx, next) {
    const page =  parseInt(ctx.query.page || 1)
    const pageSize = parseInt(ctx.query.pageSize || 10)
    const listData = await getPageList(ctx.query.contract, null, page, pageSize)
    ctx.body = new SuccessModel(listData)
})

router.get('/candidate-protocol-list', tokenCheck, checkWhitelist, async function (ctx, next) {
    if (ctx.session.username == null) {
        console.error('is admin, but no login')
        // 未登录
        ctx.body = new ErrorModel('no login')
        return
    }
    const page =  parseInt(ctx.query.page || 1)
    const pageSize = parseInt(ctx.query.pageSize || 10)
    const candidate =  ctx.session.username
    
    const listData = await getPageList(null, candidate, page, pageSize)
    ctx.body = new SuccessModel(listData)
})


router.get('/detail', async function (ctx, next) {
    const data = await getDetail(ctx.query.id);
    ctx.body = new SuccessModel(data)
})

router.post('/invite-candidate', tokenCheck, checkWhitelist, async function (ctx, next) {
    const body = ctx.request.body
    body.employer = ctx.session.username
    const result = await sendInvitation(body)
    ctx.body = result

})

router.post('/send_proposal', tokenCheck, checkWhitelist, async function (ctx, next) {
    const body = ctx.request.body
    body.candidate = ctx.session.username
    const result = await sendProposal(body)
    ctx.body = result


})

router.post('/accept-invitation', tokenCheck, checkWhitelist, async function (ctx, next) {
    const candidateAddress = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await acceptInvitation(candidateAddress, protocolId)
    ctx.body = val
})

// refuseInvitation
router.post('/refuse-invitation', tokenCheck, checkWhitelist, async function (ctx, next) {
    const candidate = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await refuseInvitation(candidate, protocolId)
    ctx.body = val;
})

// accept-proposal
router.post('/accept-proposal', tokenCheck, checkWhitelist, async function (ctx, next) {
    const employer = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const data = await acceptProposal(employer, protocolId)
    ctx.body = data
})

// refuseProposal
router.post('/refuse-proposal', tokenCheck, checkWhitelist, async function (ctx, next) {
    const employer = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await refuseProposal(employer, protocolId)
    ctx.body = val
})

// cancel-invitation
router.post('/cancel-invitation', tokenCheck, checkWhitelist, async function (ctx, next) {
    const employer = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await cancelInvitation(employer, protocolId)
    ctx.body = val
})

router.post('/finish-protocol', tokenCheck, checkWhitelist, async function (ctx, next) {
    const candidate = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await finishProtocol(candidate, protocolId)
    ctx.body = val
})

router.post('/protocol-active-pending', tokenCheck, checkWhitelist, async function (ctx, next) {
    const protocolId = ctx.request.body.protocolId
    const val = await updateProtocolStatus(protocolId, ProtocolStatusEnum.ACTIVE_PENDING)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('protocol active pending failed')
    }
})


module.exports = router
