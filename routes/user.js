const router = require('koa-router')()
const { generateNonce, checkSign } = require('../controller/user')
const { checkWhitelist } = require('../controller/whitelist-user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.prefix('/ccc/user')

router.get('/checkWhitelist', async function (ctx, next) {
    const address = ctx.session.username
    const result = await checkWhitelist(address)
    if (result) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('not in whitelist')
    }

})

router.get('/nonce', async function (ctx, next) {
    const address = ctx.query.address
    const nonce = await generateNonce(address)
    ctx.body = new SuccessModel({
        nonce: nonce
    })
})

router.post('/sign-check', async function (ctx, next) {
    const body = ctx.request.body
    const token = await checkSign(body);
    if(token){
        ctx.body = new SuccessModel({
            token: token
        })
    } else{
        ctx.body = new ErrorModel('sign check error')

    }
})

module.exports = router