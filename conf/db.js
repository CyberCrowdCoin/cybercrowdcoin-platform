const env = process.env.NODE_ENV  // 环境参数

// 配置
let MYSQL_CONF
let IPFS_CONF

if (env === 'dev') {
    // mysql
    MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: 'root230668',
        port: '3306',
        database: 'ccc_db'
    }

    // ipfs
    IPFS_CONF = {
        host: {domain:"127.0.0.1", url_prefix:"http://127.0.0.1:8080/ipfs/"},
        port: 5001,
        protocol: 'http'
    }
}

if (env === 'production') {
    // mysql
    MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: 'root230668',
        port: '3306',
        database: 'ccc_db'
    }

    // ipfs
    IPFS_CONF = {
        host: {domain:"127.0.0.1", url_prefix:"https://ipfs.io/ipfs/"},
        port: 5001,
        protocol: 'http'
    }
}

module.exports = {
    MYSQL_CONF,
    IPFS_CONF
}