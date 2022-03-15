// 企业微信所有回调服务的解析
import Router from 'koa-router';
import fxp from 'fast-xml-parser';
import Encryption from './encrypt.js';
import handleEvent from './handleEvent.js';
const router = new Router();
const encryption = new Encryption();

router.get('/text', ctx => {
  ctx.$util.success('Hello World!88888');
});

router.get('/', (ctx, next) => {
  const { msg_signature, timestamp, nonce, echostr } = ctx.request.query;
  const replyEchostrMsg = encryption.verifyURL(msg_signature, timestamp, nonce, echostr);

  // 这里要原样返回，所有只能返回原始数据，不能用[ctx.$util.success]返回，坑就在这里，因为这样返回就是一个包装后的对象了
  ctx.body = replyEchostrMsg;
});
router.post('/', async (ctx, next) => {
  const bodyStr = await ctx.$util.$readStream(ctx);
  const { msg_signature, timestamp, nonce } = ctx.request.query;
  const msgBody = encryption.decryptMsg(msg_signature, timestamp, nonce, bodyStr);
  console.log(msgBody, '---------------------');

  // const testXmlData = MessageHandle.textXml(msgBody);
  // // 加密消息体
  // const sendReplyMsg = encryption.encryptMsg(testXmlData);
  const body = handleEvent(msgBody);

  ctx.body = body;
});

/**
 * @description: 为了演示，我们构建一个明文的文本消息结构   这里可以把企业微信的所有要返回 xml 格试的响应体填进去，要注意判断区分
 * @param {type}
 * @return:
 */
class MessageHandle {
  static textXml({ toUser, fromUser, content }) {
    const sTimeStamp = parseInt(new Date().valueOf() / 1000);
    return {
      sReplyMsg: `<xml><ToUserName><![CDATA[${toUser}]]></ToUserName><FromUserName><![CDATA[${fromUser}]]></FromUserName><CreateTime>${sTimeStamp}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${content}]]></Content></xml>`,
      sTimeStamp
    };
  }
}

export default router.routes();
