const router = require('koa-router')()
const {
    getList,
    getDetail,
    newCandidate,
    addSkills,
    deleteSkill,
    getSkillListByCandidate,
    getPageList
} = require('../controller/candidate')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { CandidateStatusEnum } = require('../model/enum')
const tokenCheck = require('../middleware/tokenCheck')
const checkWhitelist = require('../middleware/whitelistCheck')


router.prefix('/ccc/candidate')

router.get('/all-list', async function (ctx, next) {
    const page =  parseInt(ctx.query.page || 1)
    const pageSize = parseInt(ctx.query.pageSize || 10);
    const listData = await getPageList(page, pageSize)
    ctx.body = new SuccessModel(listData)
})

router.get('/detail', async function (ctx, next) {
    const user = ctx.query.user
    const data = await getDetail(user);
    if(data != null) {
        const skills = await getSkillListByCandidate(user)
        data.skills = skills;
    }
    ctx.body = new SuccessModel(data)
})

router.post('/register', tokenCheck, checkWhitelist, async function (ctx, next) {
    const body = ctx.request.body
    body.user = ctx.session.username
    const data = await newCandidate(body)
    ctx.body = new SuccessModel(data)

})

router.get('/skill-list', async function (ctx, next) {
    const candidate = ctx.query.candidate
    const data = await getSkillListByCandidate(candidate)
    ctx.body = new SuccessModel(data)
})

router.post('/add-skill', tokenCheck, checkWhitelist, async function (ctx, next) {
    const body = ctx.request.body
    body.user = ctx.session.username
    const data = await addSkills(body)
    ctx.body = new SuccessModel(data)

})

router.post('/delete-skill', tokenCheck, checkWhitelist, async function (ctx, next) {
    const data = await deleteSkill(ctx.request.body.id, ctx.session.username)
    ctx.body = new SuccessModel(data)

})


module.exports = router
