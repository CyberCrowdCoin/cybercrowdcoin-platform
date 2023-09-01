const Sequelize = require('sequelize')
const xss = require('xss')
const Candidate = require('../db/mysql/model/Candidate')
const CandidateSkill = require('../db/mysql/model/CandidateSkill')
const {addToIpfs} = require('../db/ipfs/ipfs')
const {CandidateStatusEnum} = require('../model/enum')


async function getList() {
    // 拼接查询条件
    const whereOpt = {}

    // 执行查询
    const list = await Candidate.findAll({
        where: whereOpt,
        order: [
            ['id', 'desc'] // 排序
        ]
    })
    return list.map(item => item.dataValues)
}

async function getDetail(id) {
    const candidate = await Candidate.findOne({
        where: {
            id,
        }
    })
    if (candidate == null) return null
    return candidate.dataValues
}

async function getDetailByUser(user) {
    const candidate = await Candidate.findOne({
        where: {
            user,
        }
    })
    if (candidate == null) return null
    return candidate.dataValues
}

async function newCandidate(candidateData = {}) {
    const qualification = xss(candidateData.qualification)
    const user = candidateData.user
    const gender = xss(candidateData.gender)
    const age = xss(candidateData.age)
    const status = CandidateStatusEnum.VALID

    // 创建MySQL记录
    const res = await Candidate.create({
        user,
        status,
        qualification,
        gender,
        age,
    })
    return {
        id: res.dataValues.id
    }
}

async function addSkills(skillData = {}) {
    const user = skillData.user
    const candidate = await getDetailByUser(user)
    if(candidate == null){
        return;
    }

    const skills = skillData.skills
    console.info("skills ---> ", skills)
    const candidateId = candidate.id;
    for (let i = 0; i < skills.length; ++i) {
        const skill = skills[i];
        await CandidateSkill.create({
            candidateId,
            skill
        })
    }
}

async function deleteSkill(id, user) {
    const candidate = await getDetailByUser(user)
    if(candidate == null){
        return;
    }
    const candidateId = candidate.id
    await CandidateSkill.destroy({
        where: {
            id,
            candidateId
        }
    })
}

async function getSkillListByCandidate(candidateId) {
    // 执行查询
    const list = await CandidateSkill.findAll({
        where: {candidateId},
        order: [
            ['id', 'desc'] // 排序
        ]
    })
    return list.map(item => item.dataValues)
}


module.exports = {
    getList,
    getDetail,
    newCandidate,
    addSkills,
    deleteSkill,
    getDetailByUser,
    getSkillListByCandidate,
}
