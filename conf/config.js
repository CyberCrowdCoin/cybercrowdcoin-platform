const env = process.env.NODE_ENV  // 环境参数


const SECRET_KEY = 'cybercrowdcoin_ccc'

// 配置
let CCCWB_CONTRACT_CONF
let CCC_CONTRACT_CONF

if (env === 'dev') {
    // contract 
    CCCWB_CONTRACT_CONF = {
        address: '0x5F19a5Bd51517329a99a3BaC59cBe8acEdd7113d',
        // rpcurl: 'http://127.0.0.1:8545',
        websocketurl: 'wss://goerli.infura.io/ws/v3/d445a41d8182464696de9e9c91db3776',
        httpUrl:'https://goerli.infura.io/v3/d445a41d8182464696de9e9c91db3776',
        gas: 3000000
    }
    // ccc token
    CCC_CONTRACT_CONF = {
        address: '0x1c3D6826624Fe9B22C13CF7afBc9eee78bc095CE'
    }
}

if (env === 'production') {
    // contract 
    CCCWB_CONTRACT_CONF = {
        address: '0x5F19a5Bd51517329a99a3BaC59cBe8acEdd7113d',
        // rpcurl: 'http://127.0.0.1:8545',
        websocketurl: 'wss://goerli.infura.io/ws/v3/d445a41d8182464696de9e9c91db3776',
        httpUrl:'https://goerli.infura.io/v3/d445a41d8182464696de9e9c91db3776',
        gas: 3000000
    }
    // ccc token
    CCC_CONTRACT_CONF = {
        address: '0x1c3D6826624Fe9B22C13CF7afBc9eee78bc095CE'
    }
}

module.exports = {
    SECRET_KEY,
    CCCWB_CONTRACT_CONF,
    CCC_CONTRACT_CONF
}