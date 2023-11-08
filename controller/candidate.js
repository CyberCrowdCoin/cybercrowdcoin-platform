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

async function getPageList(page = 1, pageSize = 10) {
    // 拼接查询条件
    const whereOpt = {}

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 执行分页查询
    const result = await Candidate.findAndCountAll({
        where: whereOpt,
        order: [['id', 'desc']],
        offset: offset,
        limit: pageSize
    });
    let list = [];
    let totalItems = 0
    if (result) {
        list = result.rows.map(item => item.dataValues);
        // 循环集合并调用接口
        for (let i = 0; i < list.length; i++) {
            const entity = list[i];
    
            // 调用接口并获取接口返回值
            const skills = await getSkillListByCandidate(entity.user); // 以某个字段的值作为参数
            if (skills) {
                // 使用 map 函数提取 skill 字段的值
                const skillList = skills.map(skillEntity => skillEntity.skill);
            
                // 将提取的 skill 字段值赋给 entity 的某个字段
                entity.skills = skillList;
            }
        }
        totalItems = result.count;
    } 
    
    return {
        list: list,
        total: totalItems
    };
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
    const twitter = xss(candidateData.twitter)
    const telegram = xss(candidateData.telegram)
    const phone = ''
    const description = xss(candidateData.description)
    const status = CandidateStatusEnum.VALID

    const [candidate, created] = await Candidate.upsert({
        user,
        status,
        qualification,
        gender,
        age,
        phone,
        description,
        twitter,
        telegram
    }, { where: { user } });

    return {
        id: candidate.id,
    };
    
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
    getPageList,
}
