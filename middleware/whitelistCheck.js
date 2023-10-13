const { checkWhitelist } = require('../controller/whitelist-user')
const { ErrorModel } = require('../model/resModel')

module.exports = async (ctx, next) => {
    const address = ctx.session.username
    const success = await checkWhitelist(address)
    if (success) {
        await next()
        return
    }
    ctx.body = new ErrorModel('not in whitelist')
}