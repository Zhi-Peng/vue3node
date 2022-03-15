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

    let user = await userSchema.findOne({ email: body.email });
    if (!user) {
      return ctx.$util.fail(ctx, '此账号没有注册');
    }
    if (body.password !== user.password) {
      return ctx.$util.fail(ctx, '密码错误');
    }

    user = user.toJSON();
    user.token = jwt.sign({ ...user }, ctx.$config.JWTs.secret, {
      expiresIn: ctx.$config.JWTs.expiresIn
    });
    ctx.$util.success(ctx, user);
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// 注册 TODO 这是要验证具体 email name 的正确性
router.post('/register', async ctx => {
  const body = ctx.request.body;
  const validField = ['password', 'email', 'code'];

  try {
    ctx.$util.validField(validField, body);
    const emailInfo = await emailSchema.findOne({ email: body.email });

    if (emailInfo && emailInfo.code === body.code) {
      const user = await userSchema.findOne({ email: body.email });

      if (user && user.email === body.email) {
        return ctx.$util.fail(ctx, '此用户已注册');
      }
      // 清空验证码
      await emailSchema.updateOne({ email: body.email }, { code: '' });
      await userSchema.create(body);
      ctx.$util.success(ctx);
    } else {
      ctx.$util.fail(ctx, '请填入正确的验正码');
    }
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// TODO 忘记密码
router.post('/forget', async ctx => {
  const body = ctx.request.body;
  const validField = ['email', 'password', 'newPassword', 'code'];
  const emailInfo = await emailSchema.findOne({ email: body.email });

  try {
    ctx.$util.validField(validField, body);
    if (emailInfo && emailInfo.code === body.code) {
      const user = await userSchema.findOne({ email: body.email });
      if (user) {
        await emailSchema.updateOne({ email: body.email }, { code: '' });
        await userSchema.updateOne({ email: body.email }, { password: body.password });
        ctx.$util.success(ctx, '修改密码成功');
      } else {
        return ctx.$util.fail(ctx, '没有此用户');
      }
    } else {
      ctx.$util.fail(ctx, '请填入正确的验正码');
    }
  } catch (err) {
    ctx.$util.fail(ctx, err.message);
  }
});

// 修改密码 一般不用单独写，走忘记密码
// router.post('/edit', async ctx => {
//   const body = ctx.request.body;
//   const validField = ['name', 'password', 'newPassword'];

//   try {
//     ctx.$util.validField(validField, body);
//     const user = await userSchema.updateOne(
//       { name: body.name },
//       { password: body.password }
//     );
//     // const user = await userSchema.findOne({ name: body.name });
//     console.log(user, 'user');
//     if (!user) {
//       return ctx.$util.success(ctx, '账号或密码不正确');
//     }
//     if (user.password !== body.password) {
//       return ctx.$util.success(ctx, '原密码不正确');
//     }
//     await user.update({ password: body.newPassword });
//     ctx.$util.success(ctx, '修改密码成功');
//   } catch (err) {
//     ctx.$util.fail(ctx, err.message);
//   }
// });

// TODO 退出要放在 radis|session 里面，当没有了就代表退出来

// TODO 注销用户  不用删除，关联的东西太多了， 直接加字段标识
// router.post('/logout', async ctx => {
//   try {
//     const data = await ctx.verify(ctx);
//     await userSchema.deleteOne({ name: data.name });
//     ctx.$util.success(ctx, '退出成功');
//   } catch (err) {
//     ctx.$util.fail(ctx, err.message);
//   }
// });

export default router.routes();
