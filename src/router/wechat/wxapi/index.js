import Router from 'koa-router';
import request from 'request-promise';
import JsapiTicket from '../jsapiTicket.js';
const router = new Router();
const jsapiTicket = new JsapiTicket();

const baseUrl = 'https://qyapi.weixin.qq.com/cgi-bin/';
const url = {
  // 获取用户信息
  user: 'user/get?access_token=ACCESS_TOKEN&userid=USERID',
  // 获取部门成员
  userSimplelist: 'user/simplelist?access_token=ACCESS_TOKEN&department_id=DEPARTMENT_ID&fetch_child=FETCH_CHILD',
  // 获取部门成员详情
  userList: 'user/list?access_token=ACCESS_TOKEN&department_id=DEPARTMENT_ID&fetch_child=FETCH_CHILD',
  // 获取所有部门
  departmentList: 'department/list?access_token=',
  // 获取标签成员
  tagUser: 'tag/get?access_token=ACCESS_TOKEN&tagid=TAGID',
  // 获取标签列表
  tagList: 'tag/list?access_token=ACCESS_TOKEN',
  // 授权
  getuserinfo: 'user/getuserinfo?access_token=ACCESS_TOKEN&code=CODE',
  // 发送应用消息
  messageSend: 'message/send?access_token=',
  // 应用推送消息
  appchatSend: 'appchat/send?access_token='
}

router.get('/ticket', async (ctx, next) => {
  const ticket = await jsapiTicket.fetchTicket(ctx.accessToken);
  ctx.success(ticket);
});
// 所有部门
router.get('/', async (ctx, next) => {
  const data = await request({
    url: `${baseUrl}${url.departmentList}${ctx.accessToken}`,
    json: true
  });
  ctx.success(data)
});
// 获取部门下的所有成员
router.get('/simplelist/:id', async (ctx, next) => {
  const params = ctx.params;
  const data = await request({
    url: `${baseUrl}user/simplelist?access_token=${ctx.accessToken}&department_id=${params.id}&fetch_child=1`,
    json: true
  });
  ctx.success(data)
});
// 获取部门下的所有成员详情
router.get('/user/list/:id', async (ctx, next) => {
  const params = ctx.params;
  const data = await request({
    url: `${baseUrl}user/list?access_token=${ctx.accessToken}&department_id=${params.id}&fetch_child=1`,
    json: true
  });
  ctx.success(data)
});
// 获取单个成员详情
router.get('/user/:id', async (ctx, next) => {
  const id = ctx.params.id;
  const data = await request({
    url: `${baseUrl}user/get?access_token=${ctx.accessToken}&userid=${id}`,
    json: true
  });
  ctx.success(data)
});


// 获取访问用户身份, 网页授权用的
router.get('/:code', async (ctx, next) => {
  const data = await request({
    url: `${baseUrl}user/getuserinfo?access_token=${ctx.accessToken}&code=${ctx.params.code}`,
    json: true
  });
  ctx.success(data)
});
// 获取客户群列表
router.get('/externalcontact/groupchat', async (ctx, next) => {
  const data = await request({
    url: `${baseUrl}externalcontact/groupchat/list?access_token=${ctx.accessToken}`,
    json: true
  });
  ctx.success(data)
});

// 发送应用消息
router.post(`/message/send`, async (ctx, next) => {
  const token = await ctx.wechat.fetchAccessToken();
  const data = await request({
    url: `${baseUrl}${url.messageSend}${ctx.accessToken}`,
    method: 'POST',
    body: ctx.request.body,
    json: true
  });
  ctx.success(data)
});


// 获取群聊会话
router.get(`/appchat/message/:groupId`, async (ctx, next) => {
  const data = await request({
    url: `${baseUrl}appchat/get?access_token=${ctx.accessToken}&chatid=${ctx.params.groupId}`,
    json: true
  });
  ctx.success(data)
});

// 创建群聊会话
router.post(`/appchat/create`, async (ctx, next) => {
  const data = await request({
    url: `${baseUrl}appchat/create?access_token=${ctx.accessToken}`,
    method: 'POST',
    body: ctx.request.body,
    json: true
  });
  ctx.success(data)
});
// 应用推送消息 这里推送的群 id 是要自己 api [/appchat/create] 创建的
router.post(`/appchat/send`, async (ctx, next) => {
  const data = await request({
    url: `${baseUrl}${url.appchatSend}${ctx.accessToken}`,
    method: 'POST',
    body: ctx.request.body,
    json: true
  });
  ctx.success(data)
});

export default router.routes();
