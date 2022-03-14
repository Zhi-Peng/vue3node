import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import userSchema from '../../models/user/index.js';
import emailSchema from '../../models/emailVerify/index.js';
const router = new Router();

router.get('/', async ctx => {
  const users = await userSchema.find().exec();
  users ? ctx.$util.success(ctx, users) : ctx.$util.fail(ctx, '获取用户失败');
});

// 登录
router.post('/', async ctx => {
  const body = ctx.request.body;
  const validField = ['email', 'password'];

  try {
    ctx.$util.validField(validField, body);

    const user = await userSchema.findOne({ email: body.email });
    if (!user) {
      return ctx.$util.fail(ctx, '此账号没有注册');
    }
    if (body.password !== user.password) {
      return ctx.$util.fail(ctx, '密码错误');
    }

    ctx.$util.success(ctx, user);
  } catch (err) {
    console.log(err.message, 6666);
    ctx.$util.fail(ctx, err.message);
  }
});

// 注册 TODO 这是要验证具体 email name 的正确性
router.post('/register', async ctx => {
  const body = ctx.request.body;
  const validField = ['password', 'email', 'code'];

  try {
    ctx.validField(validField, body);
    const emailInfo = await emailSchema.findOne({ email: body.email });

    if (emailInfo && emailInfo.code === body.code) {
      const user = await userSchema.findOne({ email: body.email });

      if (user && user.email === body.email) {
        return ctx.fail('此用户已注册');
      }
      // 清空验证码
      await emailSchema.updateOne({ email: body.email }, { code: '' });

      const data = {
        ...body,
        token: jwt.sign(body, ctx.$config.JWTs.secret, { expiresIn: ctx.$config.JWTs.expiresIn })
      };
      const users = await userSchema.create(data);
      ctx.success(users);
    } else {
      ctx.fail('请填入正确的验正码');
    }
  } catch (err) {
    ctx.fail(err.message);
  }
});

// TODO 忘记密码
router.post('/forget', async ctx => {
  const body = ctx.request.body;
  const validField = ['email', 'password', 'newPassword', 'code'];
  const emailInfo = await emailSchema.findOne({ email: body.email });

  try {
    ctx.validField(validField, body);
    if (emailInfo && emailInfo.code === body.code) {
      const user = await userSchema.findOne({ email: body.email });
      if (user) {
        await emailSchema.updateOne({ email: body.email }, { code: '' });
        await userSchema.updateOne({ email: body.email }, { password: body.password });
        ctx.success('修改密码成功');
      } else {
        return ctx.fail('没有此用户');
      }
    } else {
      ctx.fail('请填入正确的验正码');
    }
  } catch (err) {
    ctx.fail(err.message);
  }
});

// 修改密码 一般不用单独写，走忘记密码
// router.post('/edit', async ctx => {
//   const body = ctx.request.body;
//   const validField = ['name', 'password', 'newPassword'];

//   try {
//     ctx.validField(validField, body);
//     const user = await userSchema.updateOne(
//       { name: body.name },
//       { password: body.password }
//     );
//     // const user = await userSchema.findOne({ name: body.name });
//     console.log(user, 'user');
//     if (!user) {
//       return ctx.success('账号或密码不正确');
//     }
//     if (user.password !== body.password) {
//       return ctx.success('原密码不正确');
//     }
//     await user.update({ password: body.newPassword });
//     ctx.success('修改密码成功');
//   } catch (err) {
//     ctx.fail(err.message);
//   }
// });

// TODO 退出要放在 radis|session 里面，当没有了就代表退出来

// TODO 注销用户  不用删除，关联的东西太多了， 直接加字段标识
// router.post('/logout', async ctx => {
//   try {
//     const data = await ctx.verify(ctx);
//     await userSchema.deleteOne({ name: data.name });
//     ctx.success('退出成功');
//   } catch (err) {
//     ctx.fail(err.message);
//   }
// });

export default router.routes();
