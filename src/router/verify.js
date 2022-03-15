import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const urls = {
  '/user': { roleType: 1, methods: ['get'] },
  '/emailVerify': { roleType: 0 },
  'user/register': { roleType: 0 },
  retrieve: { roleType: 0 },
  findPassword: { roleType: 0 },
  active: { roleType: 0 }
};

const verify = ctx => {
  return new Promise((resolve, reject) => {
    const role = urls[ctx.url];
    if (!role) {
      resolve('非法请求链接' + ctx.url);
    } else if (!role.roleType) {
      resolve({});
    } else {
      if (role.methods && role.methods.methods.includes(ctx.method)) {
      }
      jwt.verify(ctx.request.header.token, config.JWTs.secret, (err, decoded) => {
        console.log(err, decoded, '-----token');
        if (err) {
          return resolve('token valid error');
        } else if (!decoded.roleType || decoded.roleType > role.roleType) {
          return resolve('对不起您无权操作！');
        }
        resolve(decoded);
      });
    }
  });
};

export default verify;
