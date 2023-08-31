const router = require('koa-router')()
const {
    getList,
    getDetail,
    newCandidate,
    addSkills,
    deleteSkill,
    getSkillListByCandidate,
} = require('../controller/candidate')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { CandidateStatusEnum } = require('../model/enum')
const tokenCheck = require('../middleware/tokenCheck')

router.prefix('/ccc/candidate')

router.get('/all-list', async function (ctx, next) {
    const listData = await getList()
    ctx.body = new SuccessModel(listData)
})

router.get('/detail', async function (ctx, next) {
    const data = await getDetail(ctx.query.id);
    if(data != null) {
        const skills = await getSkillListByCandidate(data.id)
        data.skills = skills;
    }
    ctx.body = new SuccessModel(data)
})

router.post('/register', tokenCheck, async function (ctx, next) {
    const body = ctx.request.body
    body.user = ctx.session.username
    const data = await newCandidate(body)
    ctx.body = new SuccessModel(data)

})

router.post('/add-skill', tokenCheck, async function (ctx, next) {
    const body = ctx.request.body
    body.user = ctx.session.username
    const data = await addSkills(body)
    ctx.body = new SuccessModel(data)

})

router.post('/delete-skill', tokenCheck, async function (ctx, next) {
    body.user = ctx.session.username
    const data = await deleteSkill(ctx.request.id)
    ctx.body = new SuccessModel(data)

})


module.exports = router
