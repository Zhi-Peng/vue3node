import Router from 'koa-router';
import departmentList from '../../../models/department/index.js';
const router = new Router();
// 获取所有部门
router.get('/', async (ctx, next) => {
  const data = await departmentList.find({}, {_id: 0, __v: 0});
  console.log(data, 'bbbbbbbbbbbbbbbb')
  
  ctx.success(data);
});

/**
 * 以下这些都可以在事件回调中同步入库更新
 * 创建部门
 * 更新部门
 * 删除部门
 */
export default router.routes();

