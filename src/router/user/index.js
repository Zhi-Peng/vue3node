import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import userSchema from '../../models/user/index.js';
import emailSchema from '../../models/emailVerify/index.js';
import config from '../../config/index.js';

async function sendEmail(email, title, text) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(config.emailServer, {
      from: '<' + config.emailServer.auth.user + '>'
    });
    transporter.sendMail(
      {
        to: email,
        subject: title,
        text
      },
      (error, info) => {
        transporter.close();
        error && console.log('发邮件错误：', error.message);
        resolve(error ? error.message : '');
      }
    );
  });
}
const router = new Router();

router.use(async (ctx, next) => {
  // ctx.logger = ctx.logger({service: 'user'})
  await next();
});

router.post('/sendEmailVerify', async ctx => {
  const body = ctx.request.body;
  const validField = ['userEmail'];
  try {
    ctx.validField(validField, body);

    const emailInfo = await emailSchema.findOne({ email: body.email });
    if (emailInfo.code === body.code) {
      await userSchema.updateOne({ userEmail: body.userEmail }, { code });
      ctx.success('注册成功');
    } else {
      ctx.fail('请填入正确的验正码');
    }
    // await sendEmail('771001201@qq.com', '测试', `欢迎你的到来，你好啊`);
  } catch (err) {
    // ctx.logger.log({ level: 'error', message: err.message });
    ctx.fail(err.message);
  }
});

router.get('/', async ctx => {
  const users = await userSchema.find().exec();
  users ? ctx.success(users) : ctx.fail('获取用户失败');
});

// 登录
router.post('/', async ctx => {
  const body = ctx.request.body;
  const validField = ['userName', 'password'];

  try {
    ctx.validField(validField, body);

    const user = await userSchema.findOne({ userName: body.userName });
    if (!user) {
      return ctx.success('此账号没有注册');
    }
    if (body.password !== user.password) {
      return ctx.success('密码错误');
    }

    ctx.success(user);
  } catch (err) {
    // ctx.logger.log({ level: 'error', message: err.message });
    ctx.fail(err.message);
  }
});

// 注册
router.post('/register', async ctx => {
  const body = ctx.request.body;
  const validField = ['userName', 'password', 'userEmail', 'code'];

  try {
    ctx.validField(validField, body);
    const emailInfo = await emailSchema.findOne({ email: body.userEmail });
    console.log(emailInfo, 33333);

    if (emailInfo && emailInfo.code === body.code) {
      const user = await userSchema.findOne({ userName: body.userName });

      if (user && user.userName === body.userName) {
        return ctx.fail('此用户名已注册');
      }
      await emailSchema.updateOne({ email: body.userEmail }, { code: '' });

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
    // ctx.logger.log({ level: 'error', message: err.message });
    ctx.fail(err.message);
  }
});

// TODO 忘记密码
router.post('/forget', async ctx => {
  const body = ctx.request.body;
  const validField = ['userName', 'password', 'newPassword'];

  try {
    ctx.validField(validField, body);
    const user = await userSchema.updateOne(
      { username: body.username },
      { password: body.password }
    );
    // const user = await userSchema.findOne({ username: body.username });
    console.log(user, 'user');
    if (!user) {
      return ctx.success('账号或密码不正确');
    }
    if (user.password !== body.password) {
      return ctx.success('原密码不正确');
    }

    // await user.update({ password: body.newPassword });
    ctx.success('修改密码成功');
  } catch (err) {
    ctx.fail(err.message);
  }
});

// 修改密码 一般不用单独写，走忘记密码
// router.post('/edit', async ctx => {
//   const body = ctx.request.body;
//   const validField = ['userName', 'password', 'newPassword'];

//   try {
//     ctx.validField(validField, body);
//     const user = await userSchema.updateOne(
//       { username: body.username },
//       { password: body.password }
//     );
//     // const user = await userSchema.findOne({ username: body.username });
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
//     await userSchema.deleteOne({ username: data.username });
//     ctx.success('退出成功');
//   } catch (err) {
//     ctx.fail(err.message);
//   }
// });

export default router.routes();
