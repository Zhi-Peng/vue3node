import Koa from 'koa';
// import formidable from 'koa2-formidable';   表单不用此插件，只接 req.on('data) 取数据
import bodyparser from 'koa-bodyparser';
import winston from 'winston';
import './db/index.js';
import router from './router/index.js';
import util from './util/index.js';
import config from './config/index.js';
import errCode from './errorCode.js';
import verify from './router/verify.js';
import Wechat from './router/wechat/accessToken.js';

const app = new Koa();
app.context.$util = util;
app.context.$config = config;

app.use(bodyparser());
app.use(async (ctx, next) => {
  ctx.wechat = new Wechat(config.wechat);
  const { access_token } = await ctx.wechat.fetchAccessToken();
  ctx.accessToken = access_token;

  ctx.success = function (data, msg) {
    if (typeof data === 'string') {
      msg = data;
      data = undefined;
    }

    ctx.body = {
      msg,
      data,
      code: 200
    };
  };

  // 这里的钷误是业务错误可以控制也可以不报错
  ctx.fail = function (msg, code) {
    if (code && !errCode[code]) {
      throw new Error('未设置的错误');
    }

    ctx.body = {
      msg,
      code: code || 0
    };
  };

  ctx.validField = (fields, body) => {
    fields.every(field => {
      if (!body[field]) {
        throw new Error(`${field} 字段不能为空`);
      }
      return body[field];
    });
  };

  ctx.logger = options => {
    return winston.createLogger({
      level: options.level || 'info',
      format: winston.format.json(),
      defaultMeta: { service: options.service || 'user-service' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  };

  ctx.verify = verify;

  await next();
});
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err, '路由里面 try catch 捕获错误');
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
app.on('error', (err, ctx) => {
  console.log(err, ctx, '全局错误');
});
app.listen(6000, () => {
  console.log('6000 成功');
});
