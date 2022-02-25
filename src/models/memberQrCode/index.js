import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const memberQrCode = new Schema({
  _id: String,
  config_id: String,
  type: Number,
  scene: Number,
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

const MemberQrCode = mongoose.model('MemberQrCode', memberQrCode);
export default MemberQrCode;