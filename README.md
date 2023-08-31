# blog koa2 sequelize

- 拷贝 blog-koa2/package.json 删掉 `mysql` ，然后 `npm i`
- 再安装 `npm i mysql2 sequelize --save`
- 再把 blog-koa2 其他文件/文件夹拷贝过来，除了 `db` 和 `controller`


- 新建 `db/seq.js` ，利用 `conf/db.js` 和 `process.env.NODE_ENV`
- 新建 `db/model/User.js` 和 `db/model/Blog.js`
- 新建 `db/sync.js`


- 新建 `controller/user.js`
- 新建 `controller/blog.js`
- 联调、测试
