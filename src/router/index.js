import Router from 'koa-router'
import util from '../util/index.js'
const router  = new Router()

const modules = [
  'user',
  'qiniu',
  'wechatEvent'
];
const wechat = [
  'member',
  'department',
  'tags',
  'customer',
  'wxapi',
  'test'
];

util.$eatch(modules, async (item) => {
  router.use(`/${item}`, (await import(`./${item}/index.js`)).default);
});
util.$eatch(wechat, async (item) => {
  router.use(`/${item}`, (await import(`./wechat/${item}/index.js`)).default);
})

export default router
