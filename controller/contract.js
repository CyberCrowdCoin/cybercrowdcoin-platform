const { Web3 } = require('web3');
const { ethers } = require('ethers');
const CCCWeb = require('../contract/build/CCCWeb.json');
const { CCCWB_CONTRACT_CONF, CCC_CONTRACT_CONF } = require('../conf/config')
// 在模块顶部初始化合约对象
const web3 = new Web3(new Web3.providers.WebsocketProvider(CCCWB_CONTRACT_CONF.websocketurl, { timeout: 30000 }));
// const web3 = new Web3( CCCWB_CONTRACT_CONF.httpUrl);

const cccWebAddress = CCCWB_CONTRACT_CONF.address;
const contract = new web3.eth.Contract(CCCWeb.abi, cccWebAddress);
const { updateDemandStatus, getDetail, addDemand } = require('./demand')
const configController = require('./config')
const protocol = require('./protocol')
const { DemandStatusEnum, ProtocolStatusEnum, ProtocolMessageTypeEnum, ConfigKeyEnum } = require('../model/enum')
const proposalMessage = require('./protocol-message')
const logger = require('../conf/log')


// 定时器间隔（毫秒）
const interval = 30000; // 30 秒钟检查一次，你可以根据需求调整间隔时间

function startTimer() {
    // 使用 setTimeout 开始一个周期
    setTimeout(async () => {
        try {

            await listenEvents();
            // 递归调用 startTimer，开启下一个周期
            startTimer();
        } catch (error) {
            console.error('Error:', error);
            // 处理错误后同样递归调用 startTimer，确保下一个周期会继续执行
            startTimer();
        }
    }, interval);
}
// 启动定时器
startTimer();

async function listenEvents() {
    try {
        // 获取当前最新区块号
        let latestBlockNumber = await web3.eth.getBlockNumber();
        // 获取上次检查的区块号（你可以将上次检查的区块号保存在数据库或文件中）
        let lastCheckedBlockNumber = await getLastCheckedBlockNumber(); // 请自行实现这个函数

        // 从上次检查的区块号开始，检查到当前最新区块之间的事件
        for (let blockNumber = Number(lastCheckedBlockNumber) + 1; blockNumber <= Number(latestBlockNumber); blockNumber++) {
            const events = await contract.getPastEvents('allEvents', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            });
            // 处理事件
            for (const event of events) {
                // 处理合约事件逻辑
                await handleEvent(event)
            }
        }
        // 保存当前最新区块号作为下次检查的起始点
        await saveLastCheckedBlockNumber(Number(latestBlockNumber));
    } catch (error) {
        console.error('Error:', error);
    }
}

// 处理事件的函数
async function handleEvent(event) {
    try {
        if (event.event === 'DemandCreated') {
            await handleDemandCreated(event.returnValues);
        } else if (event.event === 'DemandEnded') {
            await handleDemandEnded(event.returnValues.demand);
        } else if (event.event === 'CandidateAdded') {
            await handleCandidateAdded(event.returnValues.protocolId);
        }
    } catch (error) {
        logger.error("contract events error", error);
    }
}

async function getLastCheckedBlockNumber() {
    const blockNumberConfig = await configController.getDetail(ConfigKeyEnum.BLOCK_NUMBER);
    return blockNumberConfig.configVal;
}

async function saveLastCheckedBlockNumber(blockNumber) {
    await configController.addConfig(ConfigKeyEnum.BLOCK_NUMBER, blockNumber);

}

async function handleCandidateAdded(protocolId) {
    const protocolData = await protocol.getDetail(protocolId);
    if (protocolData && protocolData.status === ProtocolStatusEnum.PROPOSAL_PENDING) {
        await protocol.updateProtocolActive(protocolId);
        await updateDemandStatus(protocolData.contract, DemandStatusEnum.ONGOING);
        await proposalMessage.newProtocolMessage(protocolData.employer, protocolId, ProtocolMessageTypeEnum.PROPOSAL_ACCETP, '')
    }
}

async function handleDemandEnded(contract) {
    const demand = await getDetail(contract);
    if (demand && DemandStatusEnum.COMPLETED !== demand.status) {
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
