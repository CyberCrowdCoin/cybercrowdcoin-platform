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
} = require('../controller/protocol')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { ProtocolStatusEnum } = require('../model/enum')
const tokenCheck = require('../middleware/tokenCheck')
router.prefix('/ccc/protocol')


router.get('/list-by-demand', async function (ctx, next) {
    const listData = await getList(ctx.query.demandId, null)
    ctx.body = new SuccessModel(listData)
})

router.get('/candidate-protocol-list', tokenCheck, async function (ctx, next) {
    if (ctx.session.username == null) {
        console.error('is admin, but no login')
        // 未登录
        ctx.body = new ErrorModel('未登录')
        return
    }
    const candidateAddress =  ctx.session.username
    const candidate = await getDetailByUser(candidateAddress)
    
    const listData = await getList(null, candidate.id)
    ctx.body = new SuccessModel(listData)
})


router.get('/detail', async function (ctx, next) {
    const data = await getDetail(ctx.query.id);
    ctx.body = new SuccessModel(data)
})

router.post('/invite-candidate', tokenCheck, async function (ctx, next) {
    const body = ctx.request.body
    body.employer = ctx.session.username
    const data = await sendInvitation(body)
    if(data){
        ctx.body = new SuccessModel(data)
    } else {
        ctx.body = new ErrorModel('invite candidate failed')
    }

})

router.post('/send_proposal', tokenCheck, async function (ctx, next) {
    const body = ctx.request.body
    body.candidate = ctx.session.username
    const data = await sendProposal(body)
    if(data){
        ctx.body = new SuccessModel(data)
    } else {
        ctx.body = new ErrorModel('send proposal failed')
    }
    

})

router.post('/accept-invitation', tokenCheck, async function (ctx, next) {
    const candidateAddress = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await acceptInvitation(candidateAddress, protocolId)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('accept invitation failed')
    }
})

// refuseInvitation
router.post('/refuse-invitation', tokenCheck, async function (ctx, next) {
    const candidateAddress = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await refuseInvitation(candidateAddress, protocolId)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('refuse invitation failed')
    }
})

// accept-proposal
router.post('/accept-proposal', tokenCheck, async function (ctx, next) {
    const employer = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await acceptProposal(employer, protocolId)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('accept proposal failed')
    }
})

// refuseProposal
router.post('/refuse-proposal', tokenCheck, async function (ctx, next) {
    const employer = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await refuseProposal(employer, protocolId)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('refuse proposal failed')
    }
})

// cancel-invitation
router.post('/cancel-invitation', tokenCheck, async function (ctx, next) {
    const employer = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await cancelInvitation(employer, protocolId)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('cancel invitation failed')
    }
})

router.post('/finish-protocol', tokenCheck, async function (ctx, next) {
    const candidateAddress = ctx.session.username;
    const protocolId = ctx.request.body.protocolId
    const val = await finishProtocol(candidateAddress, protocolId)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('finish protocol failed')
    }
})


module.exports = router
