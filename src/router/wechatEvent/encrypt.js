import crypto from 'crypto';
import fxp from 'fast-xml-parser';
import config from '../../config/index.js';
import errCode from './ErrorCode.js';

/**
 * 提供接收和推送给公众平台消息的加解密接口.
 */
class Encrypt {
  constructor () {
    const {Token, EncodingAESKey } = config.encryption;
    this.token = Token
    this.encodingAesKey = EncodingAESKey;
    this.key = Buffer.from(EncodingAESKey + '=', 'base64');
    this.iv = this.key.slice(0, 16);
    this.receiveId = config.wechat.aorpid
  }

  /**
   * 验证URL
   * @param {string} sMsgSignature 签名串，对应URL参数的msg_signature
   * @param {string} sTimeStamp 时间戳，对应URL参数的timestamp
   * @param {string} sNonce 随机串，对应URL参数的nonce
   * @param {string} sEchoStr 随机串，对应URL参数的echostr
   * @param {string} sReplyEchoStr 解密之后的echostr，当return返回0时有效
   */
    verifyURL(sMsgSignature, sTimeStamp, sNonce, sEchoStr = null) {
      if (this.encodingAesKey.length !== 43) {
        return errCode.IllegalAesKey;
      }
      
      return this.decrypt(sEchoStr, this.receiveId);
    }
  
/**
 * 加密
 * @param {string} xmlMsg 原始需要加密的消息
 * @param {string} receiveId 想当于企业 ID 不同应用场景传不同的 ID
 */
  encrypt (xmlMsg, receiveId) {
    try {
      // 1. 生成随机字节流
      let random16 = crypto.pseudoRandomBytes(16);
      // 2. 将明文消息转换为 buffer
      let msg = Buffer.from(xmlMsg);
      // 3. 生成四字节的 Buffer
      let msgLength = Buffer.alloc(4);
      // 4. 生成4个字节的msg长度
      msgLength.writeUInt32BE(msg.length, 0);
      // 5. 将corpId以二进制的方式写入内存
      let corpId = Buffer.from(receiveId);
      // 6. 拼接成 buffer
      let raw_msg = Buffer.concat([random16, msgLength, msg, corpId]);
      // 7. 加密 创建加密对象
      let cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
      // 8. 取消自动填充
      cipher.setAutoPadding(false);
      // 9. 使用 PKCS#7 填充
      raw_msg = this.PKCS7Encoder(raw_msg);
      let cipheredMsg = Buffer.concat([cipher.update(/*encoded*/raw_msg), cipher.final()]);
      return cipheredMsg.toString('base64');
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * 解密
   * @param {mix} encrypted 
   * @param {number} receiveId 想当于企业 ID
   */
  decrypt (encrypted, receiveId) {
    try {
      let aesCipher = crypto.createDecipheriv("aes-256-cbc", this.key, this.iv);
      aesCipher.setAutoPadding(false); //不自动切断

      let decipheredBuff = Buffer.concat([aesCipher.update(encrypted, 'base64'), aesCipher.final()]);
      decipheredBuff = this.PKCS7Decoder(decipheredBuff);
      // 去掉rand_msg头部的16个随机字节，4个字节的msg_len, 和尾部的$CorpID即为最终的消息体原文msg
      let len_netOrder_corpid = decipheredBuff.slice(16); //去掉rand_msg头部的16个随机字节
      let msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0); // 4个字节的msg_len
      const result = len_netOrder_corpid.slice(4, msg_len + 4).toString();  // 最终的消息体原文msg
      let appId = len_netOrder_corpid.slice(msg_len + 4).toString(); // 尾部的$CorpID

      if (receiveId && receiveId === appId) { // 验证企业Id，不对则不通过
        return result; // 返回一个解密后的明文-
      } else {
        // return result; // 返回一个解密后的明文-
        throw Error(errCode.ValidateCorpidError);
      }
    } catch (error) {
      return new Error('errCode:' + errCode['ValidateCorpidError']);
    }
  }

  /**
   * 对需要加密的明文进行填充补位 微信用的这种算发 官方文档已说明
   * @param {*} text 需要进行填充补位操作的明文
   */
  PKCS7Encoder(text) {
    const blockSize = 32;
    const textLength = text.length;
    // 计算需要填充的位数
    const amountToPad = blockSize - (textLength % blockSize);
    const result = Buffer.alloc(amountToPad);
    result.fill(amountToPad);
    return Buffer.concat([text, result]);
  }

  /**
   * 
   * 对解密后的明文进行补位删除
   * @param {string} buff 解密后的明文
   */
  PKCS7Decoder(buff) {
    var pad = buff[buff.length - 1];
    if (pad < 1 || pad > 32) {
      pad = 0;
    }
    return buff.slice(0, buff.length - pad);
  }

/**
 * 将公众平台回复用户的消息加密打包.
 * @param {string} sReplyMsg 公众平台待回复用户的消息，xml格式的字符串
 * <xml> //此处sReplyMsg的格式形式如下，其中由于回复的格式不同，MsgType有所不同
        <ToUserName><![CDATA[toUser]]></ToUserName>
        <FromUserName><![CDATA[fromUser]]></FromUserName>
        <CreateTime>1348831860</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[this is a test]]></Content>
    </xml>
  * @param {string} sTimeStamp 时间戳，可以自己生成，也可以用URL参数的timestamp
  * @param {string} sNonce 随机串，可以自己生成，也可以用URL参数的nonce
  * @param {string} sEncryptMsg 加密后的可以直接回复用户的密文，包括msg_signature, timestamp, nonce, encrypt的xml格式的字符串
  * @return {xml} 加密后的微信标准回包的json格式
  * <xml>
        <ToUserName><![CDATA[toUser]]></ToUserName>
        <FromUserName><![CDATA[fromUser]]></FromUserName>
        <CreateTime>1348831860</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[this is a test]]></Content>
    </xml>
  */
  encryptMsg ({ sReplyMsg, sTimeStamp }) {
    let objStandWechatData = {
      xml: {}
    }
    let result = {
      Encrypt: {
        _cdata: null,
      },
      MsgSignature: {
        _cdata: null,
      },
      TimeStamp: null,
      Nonce: {
        _cdata: null,
      }          
    };

    result.Encrypt._cdata = this.encrypt(sReplyMsg, this.receiveId); //加密消息
    result.Nonce._cdata = parseInt((Math.random() * 100000000000), 10); //生成随机数
    result.TimeStamp = sTimeStamp || Math.floor(new Date().getTime() / 1000); //获取时间戳
    result.MsgSignature._cdata = this.getSignature(result.TimeStamp, result.Nonce._cdata, result.Encrypt._cdata); //获得签名
    objStandWechatData.xml = result;

    //参考URL：https://www.cnblogs.com/ajanuw/p/9122228.html
    //转换为xml格式
    let XmlParser = fxp.j2xParser;
    let xmlParser = new XmlParser({
      cdataTagName: "_cdata",
    });
    let xmlResult = xmlParser.parse(objStandWechatData);
    // console.log(xmlResult);

    return xmlResult;
  }

  
/**
  * 检验消息的真实性，并且获取解密后的明文.
  * <ol>
  *    <li>利用收到的密文生成安全签名，进行签名验证</li>
  *    <li>若验证通过，则提取xml中的加密消息</li>
  *    <li>对消息进行解密</li>
  * </ol>
  * @param {string} sMsgSignature  签名串，对应URL参数的msg_signature
  * @param {string} sTimeStamp string 时间戳 对应URL参数的timestamp
  * @param {string} sNonce 随机串，对应URL参数的nonce
  * @param {string} sPostData 密文，对应POST请求的数据
  * @param {string} sMsg 解密后的原文
  */
  decryptMsg (sMsgSignature, sTimeStamp, sNonce, sPostData = null) {
    try {
      //将XMl解析成对象
      if (sPostData) {
        if (!fxp.validate(sPostData)) { //optional (it'll return an object in case it's not valid)
          console.log('XML格式出错');
          throw new Error('XML格式出错');
        }
        const PostDataJsonObj = fxp.parse(sPostData).xml;
        const EncryptMsg = PostDataJsonObj.Encrypt;
 
        if (sMsgSignature !== this.getSignature(sTimeStamp, sNonce, EncryptMsg)) {
          throw new Error('ivalid MsgSignature');
        }
        //此时返回的是明文XML，需要转换为对象
        let echoStrXml = this.decrypt(EncryptMsg, this.receiveId);

        //进一步检验XML格式是否正确

        if (!fxp.validate(echoStrXml)) {
          console.log('XML格式出错');
          throw new Error('XML格式出错');
        }

        const echoStrObj = fxp.parse(echoStrXml).xml;
        return echoStrObj;
      }
    } catch (error) {
            
    }
  }

  getSignature (timestamp, nonce, echostr) {
    const signatureStr = [this.token, timestamp, nonce, echostr].sort().join('')
    return this.sha1(signatureStr );
  }

  sha1(str) {
    let sha1String = crypto.createHash('sha1');
    sha1String.update(str);
    const sign = sha1String.digest('hex');

    return sign;
  }
}

export default Encrypt;