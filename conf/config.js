const env = process.env.NODE_ENV  // 环境参数


const SECRET_KEY = 'cybercrowdcoin_ccc'

// 配置
let CCCWB_CONTRACT_CONF
let CCC_CONTRACT_CONF

if (env === 'dev') {
    // contract 
    CCCWB_CONTRACT_CONF = {
        address: '0x1DE254430b4C72D5cAff67473a40881f7E4d2cE8',
        rpcurl: 'http://127.0.0.1:8545',
        websocketurl: 'ws://127.0.0.1:8545',
        gas: 3000000
    }
    // ccc token
    CCC_CONTRACT_CONF = {
        address: '0x2892eCb5C0b0d41a43BC6687E51116B4e4e8f05e'
    }
}

if (env === 'production') {
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

module.exports = {
    SECRET_KEY,
    CCCWB_CONTRACT_CONF,
    CCC_CONTRACT_CONF
}