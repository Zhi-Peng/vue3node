import Router from 'koa-router';
const router = new Router();

const modules = ['user', 'qiniu', 'wechatEvent', 'emailVerify', 'prize'];
const wechat = ['member', 'department', 'tags', 'customer', 'wxapi', 'test'];

modules.forEach(async item => {
  router.use(`/${item}`, (await import(`./${item}/index.js`)).default);
});
wechat.forEach(async item => {
  router.use(`/${item}`, (await import(`./wechat/${item}/index.js`)).default);
});

export default router;
