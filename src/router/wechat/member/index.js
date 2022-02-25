import Router from 'koa-router';
import request from 'request-promise';
import memberList from '../../../models/member/index.js';
const router = new Router();
// 获取所有成员详情
router.get('/', async (ctx, next) => {
  const data = await memberList.find();
  ctx.success(data);
});

// 获取单个成员详情
router.get('/:userid', async (ctx, next) => {
  const userid = ctx.request.params.userid;
  const data = await memberList.findOne({userid});
  ctx.success(data);
});

// 获取部门成员简单列表
router.get('/simplelist/:departmentId', async (ctx, next) => {
  const departmentId = ctx.request.params.departmentId;
  const data = await memberList.find({department: {$elemMatch: { $eq: departmentId }}}, 'userid name department open_userid');
  ctx.success(data);
});

// 获取部门成员详情列表
router.get('/detaillist/:departmentId', async (ctx, next) => {
  const departmentId = ctx.request.params.departmentId;
  const data = await memberList.find({department: {$elemMatch: { $eq: departmentId }}});
  ctx.success(data);
});

/**
 * 以下这些都可以在事件回调中同步入库更新
 * 创建成员
 * 更新成员
 * 删除成员
 * 批量删除成员
 * userid 与 openid 互换 这个 api 要特殊条件,具体看 api 文档
 */
export default router.routes();

