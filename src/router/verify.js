import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const urls = {
  '/user': { roleType: 1, methods: ['get'] },
  register: { roleType: 0 },
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
      jwt.verify(ctx.request.header.token, config.JWTs.secret, (err, decoded) => {
        console.log(err, decoded, 666);
        if (err) {
          return resolve('token 验证失败');
        } else if (!decoded.roleType || decoded.roleType > role.roleType) {
          return resolve('对不起您无权操作！');
        }
        resolve(decoded);
      });
    }
  });
};

export default verify;
