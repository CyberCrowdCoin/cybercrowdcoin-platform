const path = require('path')
const winston = require('winston');


// 指定输出文件的路径
const logFilePath = path.join(__dirname, '..', 'logs', 'business.log')
;

// 配置日志输出到文件
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: logFilePath })
  ]
});
// 导出日志记录器
module.exports = logger;

console.info("Log configuration complete.");


// 示例：记录日志
// logger.info('This will be written to output.log');
// logger.error('An error message to the log file.');