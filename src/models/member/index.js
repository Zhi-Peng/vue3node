// 成员详情
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const memberlist  = new Schema({
  userid: String,
  name: String,
  department: [Number],
  order: [Number],
  position: String,
  mobile: String,
  gender: String,
  email: String,
  is_leader_in_dept: [Number],
  avatar: String,
  thumb_avatar: String,
  telephone: String,
  alias: String,
  status: Number,
  address: String,
  hide_mobile: Number,
  english_name: String,
  open_userid: String,
  main_department: Number,
  extattr: {
    attrs: [
      {
        type: Number,
        name: String,
        text: {
          value: String
        },
        web: {
          url: String,
          title: String
        }
      }
    ]
  },
  qr_code: String,
  external_position: String,
  external_profile: {
    external_corp_name: String,
    external_attr: [
      {
        type: Number,
        name: String,
        text: {
          value: String
        },
        web: {
          url: String,
          title: String
        },
        miniprogram: {
          appid: String,
          pagepath: String,
          title: String
        }
      }
    ]
  }
},
{
  timestamps: true
  // versionKey: false
});

memberlist.index({userid: 1}, {unique:true, background: true});
const Memberlist = mongoose.model('Member', memberlist);

export default Memberlist ;