import Router from 'koa-router';
import memberTags from '../../../models/memberTags/index.js';
import tagMemberList from '../../../models/tagMemberList/index.js';
const router = new Router();

// 获取标签列表
router.get('/', async (ctx, next) => {
  const data = await memberTags.find({}, {_id: 0, __v: 0});
  ctx.success(data);
});

// 获取标签列表
router.get('/members', async (ctx, next) => {
  const data = await tagMemberList.find({}, {_id: 0, __v: 0});
  ctx.success(data);
});

// 获取标签成员
/**
 * 以下这些都可以在事件回调中同步入库更新
 * 创建
 * 更新
 * 删除
 */
export default router.routes();
