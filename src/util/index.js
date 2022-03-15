import winston from 'winston';
import errCode from '../errorCode.js';

export default {
  success(ctx, data, msg) {
    if (typeof data === 'string') {
      msg = data;
      data = undefined;
    }

    ctx.body = {
      msg,
      data,
      code: 200
    };
  },

  // 这里的钷误是业务错误可以控制也可以不报错
  fail(ctx, msg, code) {
    if (code && !errCode[code]) {
      throw new Error('未设置的错误');
    }

    ctx.body = {
      msg,
      code: code || 0
    };
  },

  logger(options) {
    return winston.createLogger({
      level: options.level || 'info',
      format: winston.format.json(),
      defaultMeta: { service: options.service || 'user-service' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  },
  // 验证字段有没有
  validField(fields, body) {
    fields.every(field => {
      if (!body[field]) {
        throw new Error(`${field} 字段不能为空`);
      }
      return body[field];
    });
  },

  $getClientIP(ctx) {
    let req = ctx.request;
    console.log(ctx.req, 2222);
    let ip =
      ctx.ip ||
      req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress ||
      '';
    let arr = ip.match(/(\d{1,3}\.){3}\d{1,3}/);

    return arr ? arr[0] : '';
  },

  $readStream(ctx) {
    return new Promise(resolve => {
      let data = '';
      ctx.req.on('data', chunk => {
        data += chunk;
      });
      ctx.req.on('end', () => {
        resolve(data);
      });
    });
  }
};
