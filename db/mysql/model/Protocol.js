const Sequelize = require('sequelize')
const seq = require('../seq')

const Protocol = seq.define(
    'protocol', // 对应数据库的 protocols 表（英文复数）
    {
        /* 不用定义 id ，seq 会自动增加 */

        demandId: {
            type: Sequelize.BIGINT,
            allowNUll: false,
            field: 'demand_id',
            comment: 'demand id'
        },

        status: {
            type: Sequelize.STRING,
            allowNUll: false
        },

        proposalMessageId: {
            type: Sequelize.BIGINT,
            allowNUll: false,
            field: 'proposal_message_id',
        },

        invitationMessageId: {
            type: Sequelize.BIGINT,
            allowNUll: false,
            field: 'invitation_message_id',
        },

        employer: {
            type: Sequelize.STRING,
            allowNUll: false,
            comment: '雇主'
        },
        
        candidateId: {
            type: Sequelize.BIGINT,
            field: 'candidate_id',
            allowNUll: false
        },

        activeDate: {
            type: Sequelize.BIGINT,
            allowNUll: false
        },

        /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
    }
)

module.exports = Protocol
