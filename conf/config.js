const env = process.env.NODE_ENV  // 环境参数


const SECRET_KEY = 'cybercrowdcoin_ccc'

// 配置
let CCCWB_CONTRACT_CONF
let CCC_CONTRACT_CONF

if (env === 'dev') {
    // contract 
    CCCWB_CONTRACT_CONF = {
        address: '0xd42E4F796FCb29DE5D609ffdf179aED1e27A3E27',
        rpcurl: 'ws://127.0.0.1:8545',
        gas: 3000000
    }
    // ccc token
    CCC_CONTRACT_CONF = {
        address: '0x94f6f02F909ca40DEd5cBEd1cb4cAB48753F73A5'
    }
}

if (env === 'production') {
    // contract 
    CCCWB_CONTRACT_CONF = {
        address: '0x74490ca7e24347713b788a63eAc7532166417445',
        rpcurl: ''
    }
    // ccc token
    CCC_CONTRACT_CONF = {
        address: '0x2b7832B4b3594FDEA11D44a9818C29d330e3C010'
    }
}

module.exports = {
    SECRET_KEY,
    CCCWB_CONTRACT_CONF,
    CCC_CONTRACT_CONF
}