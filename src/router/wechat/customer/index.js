import Router from 'koa-router';
import customerDetails from '../../../models/customerDetails/index.js';

const router = new Router();

router.get('/', async (ctx, next) => {
  const data = await customerDetails.find();
  ctx.success(data);
});
export default router.routes();