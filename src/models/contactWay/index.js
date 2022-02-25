// 配置客户联系「联系我」方式
import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const externalcontact = new Schema({
  _id: false,
  config_id: String,
  type: Number,
  style: Number,
  remark: String,
  skip_verify: Boolean,
  state: String,
  qr_code: String,
  user: [String],
  party: [Number],
  is_temp: Boolean,
  expires_in: Number,
  chat_expires_in: Number,
  unionid: String,
  conclusions: {
    text: {
      content: String
    },
    image: {
      pic_url: String
    },
    link: {
      title: String,
      picurl: String,
      desc: String,
      url: String
    },
    miniprogram: {
      title: String,
      pic_media_id: String,
      appid: String,
      page: String
    }
  }
});

const Externalcontact = mongoose.model('Externalcontact', externalcontact);

export default Externalcontact;