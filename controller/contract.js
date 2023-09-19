const { Web3 } = require('web3');
const CCCWeb = require('../contract/build/CCCWeb.json');
const { CCCWB_CONTRACT_CONF, CCC_CONTRACT_CONF } = require('../conf/config')
// 在模块顶部初始化合约对象
const web3 = new Web3(new Web3.providers.HttpProvider(CCCWB_CONTRACT_CONF.rpcurl));
const cccWebAddress = CCCWB_CONTRACT_CONF.address;
const gas = CCCWB_CONTRACT_CONF.gas;
const contract = new web3.eth.Contract(CCCWeb.abi, cccWebAddress);

async function endDemandContract(demandAddress, creator, tokenAmount) {
    const tokenValue = getTokenValue(tokenAmount);
    // 交易选项
    const txOpts = {
        from: creator, // 替换成你的以太坊地址
        gas: gas, // 设置合适的 gas 限制
    };
    console.info("endDemand", demandAddress, creator, tokenValue);

    await contract.methods.endDemand(demandAddress, creator, tokenValue)
        .send(txOpts)
        .on('transactionHash', (hash) => {
            console.log('endDemand Transaction Hash:', hash);
        })
        .on('receipt', (receipt) => {
            console.log('endDemand Transaction Receipt:', receipt);
        })
        .on('error', (error) => {
            console.error('endDemand Transaction Error:', error);
        });
}

async function addCandidateContract(demandAddress, creator, candidate, ipfsUrl) {
    // 交易选项
    const txOpts = {
        from: creator, // 替换成你的以太坊地址
        gas: gas, // 设置合适的 gas 限制
    };
    
    const ipfsUrlBytes = web3.utils.asciiToHex(ipfsUrl);
    console.info("addCandidate", demandAddress, creator, candidate, ipfsUrlBytes);
    await contract.methods.addCandidate(demandAddress, candidate, ipfsUrlBytes)
        .send(txOpts)
        .on('transactionHash', (hash) => {
            console.log('addCandidate Transaction Hash:', hash);
        })
        .on('receipt', (receipt) => {
            console.log('addCandidate Transaction Receipt:', receipt);
        })
        .on('error', (error) => {
            console.error('addCandidate Transaction Error:', error);
        });
}

// async function createDemandContract(creator, tokenAmount, ipfsUrl) {
//     const tokenValue = getTokenValue(tokenAmount);
//     const ipfsUrlBytes = web3.utils.asciiToHex(ipfsUrl); // 转换为以太坊可识别的字节数组
//     // 交易选项
//     const txOpts = {
//         from: creator, // 替换成你的以太坊地址
//         gas: gas, // 设置合适的 gas 限制
//     };
//     // 调用智能合约函数
//     console.info("createDemand", creator, tokenValue, ipfsUrlBytes);
//     let returnValue;
//     await contract.methods.createDemand(creator, tokenValue, ipfsUrlBytes)
//         .send(txOpts)
//         .on('receipt', function (receipt) {
//             console.log('Transaction Receipt:', receipt);
//             // 从 receipt 中获取智能合约函数的返回值
//             // const returnValue = receipt.events;
//             // console.log("returnValue---------> ", returnValue);
//         })
//         .on('error', (error) => {
//             console.error('Transaction Error:', error);
//         });
//     return returnValue;
// }

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
    endDemandContract,addCandidateContract
}
