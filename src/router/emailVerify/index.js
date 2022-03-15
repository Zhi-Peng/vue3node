import Router from 'koa-router';
import nodemailer from 'nodemailer';
import emailVerifySchema from '../../models/emailVerify/index.js';
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

router.post('/', async ctx => {
  const body = ctx.request.body;
  const validField = ['email'];

  try {
    ctx.$util.validField(validField, body);
    const data = await emailVerifySchema.findOne({ email: body.email });
    // getTime 可更正为时间戳  toString 可更正为时间字符串
    // 当时间间隔大于一分钟时可以继续发送验证码
    // const curTime = Date.now() - 1000 * 60;
    // if (data && data.updatedAt > curTime) {
    //   return ctx.$util.success(ctx, '不能频繁发送验证码');
    // }

    let loopNum = 4,
      code = '';

    while (loopNum--) {
      const codeItem = Math.floor(Math.random() * 10);
      code += codeItem;
    }
    await emailVerifySchema.findOneAndUpdate(
      {
        email: body.email
      },
      {
        email: body.email,
        code
      },
      { upsert: true }
    );
    return ctx.$util.success(ctx, `验证码为${code}`);
    // await sendEmail('771001201@qq.com', '测试', `欢迎你的到来，你好啊`);
  } catch (err) {
    // ctx.logger.log({ level: 'error', message: err.message });
    ctx.$util.fail(ctx, err.message);
  }
});

export default router.routes();
