import jwt from 'jsonwebtoken'
import config from '../config/index.js'

// cons urls = {
//   login: {userType: 0},
//   register: {userType: 0},
//   retrieve: {userType: 0},
//   findPassword: {userType: 0},
//   active: {userType: 0},
// }

const verify = (ctx) => {
  return new Promise((resolve, reject) => {
    console.log(ctx.request.header.token, config.JWTs.secret, 'ddddddddddddd')
    jwt.verify(ctx.request.header.token, config.JWTs.secret, (err, decoded) => {
      if (err) {
        console.log(err, 'iiiiiiiiiii')
        return resolve('token 验证失败')
      }
      // else if (decoded.user_type > userType) {
      //   return resolve('对不起您无权操作！')
      // }

      resolve(decoded);
    })
  })
}

export default verify;
