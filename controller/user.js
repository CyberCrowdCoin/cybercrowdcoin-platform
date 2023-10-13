const { recoverTypedSignature } = require('@metamask/eth-sig-util');
const { ethers } = require('ethers');
const { toChecksumAddress } = require('ethereumjs-util');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../db/mysql/model/User')
const { SECRET_KEY } = require('../conf/config')


async function generateNonce(address) {
    const user = await getUser(address);
    if (user) {
        return user.nonce
    }
    return addUser(address)
}

async function getUser(address) {
    const user = await User.findOne({
        where: {
            address,
        }
    })
    if (user == null) return null
    return user.dataValues
}

async function addUser(address) {
    const nonce = Math.floor(Math.random() * 1000000)
    await User.create({
        address,
        nonce,
    })
    return nonce
}

async function updateUser(address) {
    const nonce = Math.floor(Math.random() * 1000000)
    const res = await User.update(
        // 要更新的内容
        {
            nonce,
        },
        // 条件
        {
            where: {
                address
            }
        }
    )
    if (res[0] >= 1) return true
    return false
}

async function checkSign(signReq) {
    const chainId = signReq.chainId
    const address = signReq.address
    const signature = signReq.signature
    const user = await getUser(address)

    const msgParams = {
        domain: {
            chainId: chainId,
            name: 'Login',
            version: '1'
        },
        message: {
            contents: 'Login',
            nonce: user.nonce,
        },
        primaryType: 'Login',
        types: {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
            ],
            Login: [
                { name: 'contents', type: 'string' },
                { name: 'nonce', type: 'uint256' },
            ],
        },
    };
    const version = "V4";
    const recoveredAddr = recoverTypedSignature({
        data: msgParams,
        signature: signature,
        version: version,
    });

    if (toChecksumAddress(recoveredAddr) === toChecksumAddress(address)) {
        try {
            const token = jsonwebtoken.sign({ "address": address }, SECRET_KEY, { expiresIn: '1h' });
            console.log(`${address} has been ${token}`)
            // 更改nonce
            await updateUser(address)
            return token
        } catch (e) {
            console.error('jwt sign error --->', e)
        }
    }
    return null
}

async function checkJwtToken(token) {
    try {
        const jwt = jsonwebtoken.verify(token, SECRET_KEY); // 如果过期将返回false
        // console.info('jwt verify -->', jwt)
        const address = jwt.address
        return {success:true, address:address}
    } catch (e) {
        console.error('jwt verify error --->', e);
        return {success:false, address:''};
    }
}

module.exports = {
    generateNonce,
    checkJwtToken,
    checkSign
}
