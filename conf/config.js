const env = process.env.NODE_ENV  // 环境参数


const SECRET_KEY = 'cybercrowdcoin_ccc'

// 配置
let CCCWB_CONTRACT_CONF
let CCC_CONTRACT_CONF

if (env === 'dev') {
    // contract 
    CCCWB_CONTRACT_CONF = {
        address: '0x2b7303e1CB1f62b4d9281E46fac5EBc79AdcaBCB',
        rpcurl: 'http://127.0.0.1:8545',
        websocketurl: 'ws://127.0.0.1:8545',
        gas: 3000000
    }
    // ccc token
    CCC_CONTRACT_CONF = {
        address: '0xb6965199674Ce79124662C815dc41B0f5b3f2d0a'
    }
}

if (env === 'production') {
    // contract 
    CCCWB_CONTRACT_CONF = {
        address: '0x1963108B61774716267F7051f8476aa82a371A03',
        rpcurl: ''
    }
    // ccc token
    CCC_CONTRACT_CONF = {
        address: '0xB76C881642ed032Be6913Fb12f6B86412Da7C43d'
    }
}

module.exports = {
    SECRET_KEY,
    CCCWB_CONTRACT_CONF,
    CCC_CONTRACT_CONF
}