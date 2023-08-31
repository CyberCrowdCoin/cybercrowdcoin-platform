const Sequelize = require('sequelize')
const seq = require('../seq')

const CandidateSkill = seq.define(
    'candidate_skill', // 对应数据库的 candidate_skills 表（英文复数）
    {
        /* 不用定义 id ，seq 会自动增加 */
        candidateId: {
            type: Sequelize.BIGINT,
            field: 'candidate_id',
            allowNUll: false
        },

        skill: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
    }
)

module.exports = CandidateSkill
