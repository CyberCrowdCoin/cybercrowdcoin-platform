const { Web3 } = require('web3');
const { ethers } = require('ethers');
const CCCWeb = require('../contract/build/CCCWeb.json');
const { CCCWB_CONTRACT_CONF, CCC_CONTRACT_CONF } = require('../conf/config')
// 在模块顶部初始化合约对象
const web3 = new Web3(new Web3.providers.WebsocketProvider(CCCWB_CONTRACT_CONF.websocketurl));
const cccWebAddress = CCCWB_CONTRACT_CONF.address;
const contract = new web3.eth.Contract(CCCWeb.abi, cccWebAddress);
const { updateDemandStatus, getDetail, addDemand } = require('./demand')
const protocol = require('./protocol')
const { DemandStatusEnum, ProtocolStatusEnum, ProtocolMessageTypeEnum } = require('../model/enum')
const proposalMessage = require('./protocol-message')
const logger = require('../conf/log')

contract.events.allEvents({
    fromBlock: 0,
    toBlock: 'latest'
}, function (error, event) { })
    .on('data', async function (event) {
        logger.info("contract event==", event)
        if (event.event === 'DemandCreated') {
            await handleDemandCreated(event.returnValues);
        }else if(event.event === 'DemandEnded') {
            await handleDemandEnded(event.returnValues.demand);
        }else if(event.event === 'CandidateAdded') {
            await handleCandidateAdded(event.returnValues.protocolId);
        }

    })

async function handleCandidateAdded(protocolId){
    const protocolData = await protocol.getDetail(protocolId);
    if(protocolData && protocolData.status === ProtocolStatusEnum.PROPOSAL_PENDING){
        await protocol.updateProtocolActive(protocolId);
        await updateDemandStatus(protocolData.contract, DemandStatusEnum.ONGOING);
        await proposalMessage.newProtocolMessage(protocolData.employer, protocolId, ProtocolMessageTypeEnum.PROPOSAL_ACCETP, '')
    }
}

async function handleDemandEnded(contract){
    const demand = await getDetail(contract);
    if(demand && DemandStatusEnum.COMPLETED !== demand.status){
        await updateDemandStatus(contract, DemandStatusEnum.COMPLETED);
    }
}

async function handleDemandCreated(returnValues) {
    // 根据contract查找记录
    const contract = returnValues.newDemand;
    const ipfsData = returnValues.ipfsData;
    const creator = returnValues.creator;
    const demandData = await getDetail(contract);
    if (contract && demandData === null) {
        // 插入
        try {
            // 使用 ethers.utils.hexDataSlice 将字节字符串还原为字节数组
            const demandBytesArray = ethers.utils.arrayify(ipfsData);

            // 使用 Buffer.from 将字节数组转换为 JSON 字符串
            const jsonString = Buffer.from(demandBytesArray).toString('utf8');

            // 使用 JSON.parse 将 JSON 字符串解析为对象
            const demand = JSON.parse(jsonString);
            demand.creator = creator;
            demand.contract = contract;
            // console.info("demandJson=    ", demand)
            await addDemand(demand);
        } catch (error) {
            console.error(error)
        }
    }
}


function getTokenValue(tokenAmount) {
    const tokenValue = {
        "value": parseInt(tokenAmount),
        "token":
        {
            "tokenId": 12345,
            "tokenContract":
                { "tokenType": 1, "tokenAddress": CCC_CONTRACT_CONF.address }
        }
    }
    return tokenValue;
}

module.exports = {
}
