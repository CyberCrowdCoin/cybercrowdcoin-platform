const Sequelize = require('sequelize')
const xss = require('xss')
const Candidate = require('../db/mysql/model/Candidate')
const CandidateSkill = require('../db/mysql/model/CandidateSkill')
const { addToIpfs } = require('../db/ipfs/ipfs')
const { CandidateStatusEnum } = require('../model/enum')


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

async function getDetail(user) {
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

    const [candidate, created] = await Candidate.upsert({
        user,
        status,
        qualification,
        gender,
        age,
    }, { where: { user } });

    return {
        id: candidate.id,
    };
    // return {
    //     id: res.dataValues.id
    // }
}

async function addSkills(skillData = {}) {
    const candidate = skillData.user
    const candidateData = await getDetail(candidate)
    if (candidateData == null) {
        return;
    }

    const skills = skillData.skills
    for (let i = 0; i < skills.length; ++i) {
        const skill = skills[i];
        await CandidateSkill.create({
            candidate,
            skill
        })
    }
}

async function deleteSkill(id, user) {
    const candidateData = await getDetail(user)
    if (candidateData == null) {
        return;
    }
    const candidate = user
    await CandidateSkill.destroy({
        where: {
            id,
            candidate
        }
    })
}

async function getSkillListByCandidate(candidate) {
    // 执行查询
    const list = await CandidateSkill.findAll({
        where: { candidate },
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
    getSkillListByCandidate,
}
