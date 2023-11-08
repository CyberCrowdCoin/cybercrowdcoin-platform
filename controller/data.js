const Demand = require('../db/mysql/model/Demand')
const Candidate = require('../db/mysql/model/Candidate')
const Protocol = require('../db/mysql/model/Protocol')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const sequelize = require('sequelize')


async function getHomePageData() {
    // 查询不同状态的需求数量
    const openDemandsCount = await Demand.count({
        where: { status: 'open' }
    });

    const ongoingDemandsCount = await Demand.count({
        where: { status: 'ongoing' }
    });

    const completedDemandsCount = await Demand.count({
        where: { status: 'completed' }
    });

    const demandData = [
        { name: 'Open', value: openDemandsCount },
        { name: 'Ongoing', value: ongoingDemandsCount },
        { name: 'Completed', value: completedDemandsCount },
    ];

    const candidateCount = await Candidate.count();
    const activeCandidates = await Protocol.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('candidate')), 'candidate']
        ]
      });
  
      // 统计去重后的数据量
      const activeCandidateCount = activeCandidates.length;
      const candidateData = [
        {name: 'Active', value: activeCandidateCount},
        {name: 'Inactive', value: candidateCount - activeCandidateCount}
      ];
      const result = {'demand' : demandData, 'candidate': candidateData}

      return new SuccessModel(result)
}

module.exports = {
    getHomePageData
}