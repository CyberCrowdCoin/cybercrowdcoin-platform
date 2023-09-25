const ipfsClient = require('ipfs-http-client');
const axios = require('axios')

const { IPFS_CONF } = require('../../conf/db')

const ipfs =  ipfsClient.create({
    host: IPFS_CONF.host.domain,
    port: IPFS_CONF.port,
    protocol: IPFS_CONF.protocol
  })

async function addToIpfs(entity ={}) {
    try {
      const added = await ipfs.add(entity);
      const cid = added.path.toString();
      const rst = IPFS_CONF.host.url_prefix + cid;
      return rst;
  } catch (error) {
      console.error("IPFS Error:", error);
      throw error;
  }
}

function getFromIpfs(uri) {
  const res = axios.get(uri);
    return res.data
}

module.exports = { addToIpfs, getFromIpfs}