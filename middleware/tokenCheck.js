const { ErrorModel } = require('../model/resModel')
const { checkJwtToken } = require('../controller/user')

module.exports = async (ctx, next) => {
    const { authorization = '' } = ctx.request.header;
    const token = authorization.replace('Bearer ', '');
    console.info('authorization ----->' , authorization)
    const { success, address } = await checkJwtToken(token);
    if (success) {
        // 设置 session
        ctx.session.username = address
        await next()
        return
    }
    ctx.body = new ErrorModel('not connect')
}