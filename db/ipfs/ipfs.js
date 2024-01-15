// const ipfsClient = require('ipfs-http-client');
const axios = require('axios')

const { IPFS_CONF } = require('../../conf/db')

// const ipfs =  ipfsClient.create({
//     host: IPFS_CONF.host.domain,
//     port: IPFS_CONF.port,
//     protocol: IPFS_CONF.protocol
//   })

async function addToIpfs(entity ={}) {
    try {
      // const added = await ipfs.add(entity);
      // const cid = added.path.toString();
      // 替换成假的
      const rst = IPFS_CONF.host.url_prefix + '1111';
      return rst;
  } catch (error) {
      console.error("IPFS Error:", error);
      throw error;
  }
}


module.exports = { addToIpfs}