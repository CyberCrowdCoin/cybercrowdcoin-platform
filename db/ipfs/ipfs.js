const ipfsClient = require('ipfs-http-client');
// import { ipfsClient } from "ipfs-http-client";

const { IPFS_CONF } = require('../../conf/db')

const ipfs =  ipfsClient.create({
    host: IPFS_CONF.host.domain,
    port: IPFS_CONF.port,
    protocol: IPFS_CONF.protocol
  })

async function addToIpfs(entity ={}) {
    try {
      const added = await ipfs.add(entity, {
        // Other options you might be using
        // ...
        duplex: true, // Configure the duplex option
     });
      const cid = added.path;
      const rst = IPFS_CONF.host.url_prefix + cid;
      return rst;
  } catch (error) {
      console.error("IPFS Error:", error);
      throw error;
  }
}

module.exports = { addToIpfs }