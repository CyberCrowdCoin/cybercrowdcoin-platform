const fs = require('fs');
const readline = require('readline');
const path = require('path');
const {
    newCandidate
} = require('./candidate')

const { addDemand } = require('./demand')

// 指定文件路径
const filePath = path.resolve(__dirname, '../conf/address.txt');

async function syncDemands() {
    // 创建可读流
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
    });
    // 逐行读取文件
    rl.on('line', async (line) => {
        console.log('Line:', line);
        // 生成一个包含四个字符串的数组
        const titles = ['LOGO design', 'Book binding design', 'Website custom development', 'Formwork station', 'Domain name/Server'
            , 'Integrated marketing', 'Online brand promotion', 'Network sales', 'Agent sales', 'Food industry qualification', 'Telecom Internet qualification', 'Tax SAAS services', 'Human resource qualification'
            , 'Business management software development', 'Development of public account', 'APP native development', 'Website custom development', 'Data processing software development'
            , 'TV advertisement', 'PCBA design', 'Literary creation', 'NFT', 'VR post-production', 'Development of trusted documentation', 'Home page design'];
        const randomIndex = Math.floor(Math.random() * titles.length);
        const title = titles[randomIndex];

        const category = title;

        const budget = Math.floor(Math.random() * (5000 - 100 + 1)) + 100;

        const twitter = await generateRandomString()
        const telegram = await generateRandomString()
        const contract = await generateRandomContract(40)
        const demandData = {
            "title": title,
            "creator": line,
            "category": category,
            "description": ' ',
            "twitter": twitter,
            "telegram": telegram,
            "budget": budget,
            "tokenAmount": 10,
            "contract": contract
        }
        // console.log("demandData: ", demandData)
        // await addDemand(demandData);
    });

    // 在文件读取完成后触发
    rl.on('close', () => {
        console.log('File reading completed.');
    });
}

async function generateRandomContract(length) {
    const characters = '0123456789abcdefABCDEF';
    let randomHex = '0x';

    for (let i = 0; i < length - 2; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomHex += characters.charAt(randomIndex);
    }

    return randomHex;
}

async function syncCandidates() {

    // 创建可读流
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
    });
    // 逐行读取文件
    rl.on('line', async (line) => {
        console.log('Line:', line);
        // 生成一个包含四个字符串的数组
        const qualifications = ['Master', 'High School', 'Bachelor', 'Doctorate', 'Postgraduate'];
        const randomIndex = Math.floor(Math.random() * qualifications.length);
        const qualification = qualifications[randomIndex];

        const genders = ['Male', 'Female'];
        const randomIndex1 = Math.floor(Math.random() * genders.length);
        const gender = genders[randomIndex1];

        const age = Math.floor(Math.random() * (50 - 18 + 1)) + 18;

        const twitter = await generateRandomString()
        const telegram = await generateRandomString()
        const candidateData = {
            "qualification": qualification,
            "user": line,
            "gender": gender,
            "age": age,
            "twitter": twitter,
            "telegram": telegram,
            "description": " "
        }
        // console.log("candidateData: ", candidateData)
        // await newCandidate(candidateData);
    });

    // 在文件读取完成后触发
    rl.on('close', () => {
        console.log('File reading completed.');
    });

}

async function generateRandomString() {
    const length = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

module.exports = {
    syncCandidates, syncDemands
}