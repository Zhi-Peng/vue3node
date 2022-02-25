export default {
  app_name: '项目',
  app_momain: 'http://localhost:8000/',
  wechatBaseUrl: 'https://qyapi.weixin.qq.com/cgi-bin/',
  wechat: {
    aorpid: 'wwa3b0222e83198d13',
    corpsecret: 'wTQzGvNlDZXkCrMsmcniW6mSwcDMdHgaCmw2sH1Npcc'
  },
  encryption: {
    Token: 'Ygr3RZ8KMUU2U',
    EncodingAESKey: '6WGy6YI29utByHz8GiLtSeFBw4ezZB6JTK5RVLFVkJH'
  },
  qiniu: {
    AK: 'laugswI0dIPYGhuSwsRegz0hgd8L5jDLLWtsKmBm',
    SK: 'MmpF89-Lia7Am0GBhdxwLhOCNrZZgeITv15QnkX3'
  },

  db: {
    host: '192.168.1.1',
    port: 8080,
    user: 'root',
    password: 'password',
    database: 'my database'
  },

  uploadPath: 'dist/upFile',

  JWTs: {
    secret: 'scscms',
    expiresIn: '2h'
  },

  emailServer: {
    service: 'qq',
    auth: {
      user: '771001201@qq.com',
      pass: 'whfgkjkcjhbwbfih'
    }
  }
}
