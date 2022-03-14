import Koa from 'koa';
// import formidable from 'koa2-formidable';   表单不用此插件，只接 req.on('data) 取数据
import bodyparser from 'koa-bodyparser';
import './db/index.js';
import router from './router/index.js';
import util from './util/index.js';
import config from './config/index.js';
import verify from './router/verify.js';

const app = new Koa();
app.context.$util = util;
app.context.$config = config;

app.use(bodyparser());
app.use(async (ctx, next) => {
  const roleValid = await verify(ctx);
  if (typeof roleValid === 'string') {
    ctx.$util.fail(ctx, roleValid);
  }
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
