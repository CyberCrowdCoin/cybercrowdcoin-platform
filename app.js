const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const path = require('path')
const fs = require('fs')
const morgan = require('koa-morgan')

const index = require('./routes/index')
const users = require('./routes/users')
const user = require('./routes/user')
const demand = require('./routes/demand')
const candidate = require('./routes/candidate')
const protocol = require('./routes/protocol')
const protocolMessage = require('./routes/protocol-message')
const data = require('./routes/data')
const cors = require('koa2-cors'); // 引入 koa2-cors 中间件


// error handler
onerror(app)

// 使用 koa2-cors 中间件
app.use(cors({
  origin: '*', // 这里可以设置允许访问的域名，'*' 表示允许所有来源访问
  credentials: true, // 如果需要发送身份验证凭证（如 cookies），可以将其设置为 true
  methods: 'GET, POST, PUT, DELETE', // 允许的 HTTP 请求方法
  headers: 'Content-Type, Authorization' // 允许的请求头
}));

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  // 开发环境 / 测试环境
  app.use(morgan('dev'));
} else {
  // 线上环境
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(morgan('combined', {
    stream: writeStream
  }));
}

// session 配置
app.keys = ['WJiol#23123_']
app.use(session({
  // 配置 cookie
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  // 配置 redis
}))

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(demand.routes(), demand.allowedMethods())
app.use(candidate.routes(), candidate.allowedMethods())
app.use(protocol.routes(), protocol.allowedMethods())
app.use(protocolMessage.routes(), protocolMessage.allowedMethods())
app.use(data.routes(), data.allowedMethods())


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
