import Router from 'koa-router'
import jwt from 'jsonwebtoken'
import userSchema from '../../models/user/index.js'
const router = new Router()

router.use(async (ctx, next) => {
  console.log('fasdf')
  // ctx.logger = ctx.logger({service: 'user'})
  await next()
})

router.get('/', async (ctx) => {
  const users = await userSchema.find().exec();
  users ? ctx.success(users) : ctx.fail('获取用户失败');
})

// 登录
router.post('/', async (ctx) => {
  const body = ctx.request.body
  const validField = [ 'userName', 'password' ];

  try {
    ctx.validField(validField, body);

    const user = await userSchema.findOne({userName: body.userName});
    if (!user) {
      return ctx.success('此账号没有注册');
    }
    if (body.password !== user.password) {
      return ctx.success('密码错误');
    }
    
    ctx.success(user);
  } catch (err) {
    // ctx.logger.log({ level: 'error', message: err.message });
    ctx.fail(err.message)
  }
})

// 注册
router.post('/register', async (ctx) => {
  const body = ctx.request.body
  const validField = [ 'userName', 'password', 'userEmail' ];

  try {
    ctx.validField(validField, body);
    const user = await userSchema.findOne({userName: body.userName});
    if (user) {
      return ctx.success('此账号已经注册, 请登录')
    };

    const data = {
      ...body,
      token: jwt.sign(body, ctx.$config.JWTs.secret, {expiresIn: ctx.$config.JWTs.expiresIn})
    }
    const users = await userSchema.create(data);
    ctx.success(users)
  } catch (err) {
    // ctx.logger.log({ level: 'error', message: err.message });
    ctx.fail(err.message)
  }
})

// 修改密码
router.post('/edit', async (ctx) => {
  const body = ctx.request.body;
  const validField = [ 'userName', 'password', 'newPassword' ];

  try {
    ctx.validField(validField, body);
    const user = await userSchema.findOne({username: body.username});
    console.log(user, 'user');
    if (!user) {
      return ctx.success('账号或密码不正确')
    };
    if (user.password !== body.password) {
      return ctx.success('原密码不正确')
    }

    await user.update({password: body.newPassword})
    ctx.success('修改密码成功');
  } catch (err) {
    ctx.fail(err.message)
  }
})

router.post('/logout', async (ctx) => {
  try {
    const data = await ctx.verify(ctx);
    await userSchema.remove({username: data.username});
    ctx.success('退出成功');
  } catch (err) {
    ctx.fail(err.message)
  }
})

// TODO 忘记密码

export default router.routes();
