// 客户详情
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const customerDetails = new Schema({
  _id: String,
  external_contact: {
    external_userid: String,
    name: String,
    position: String,
    avatar: String,
    corp_name: String,
    corp_full_name: String,
    type: {
      type: Number
    },
    gender: Number,
    unionid: String,
    external_profile: {
      external_attr: [
        {
          type: {
            type: Number
          },
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
  follow_user: [
    {
      userid: String,
      remark: String,
      description: String,
      createtime: Number,
      tags: [
        {
          group_name: String,
          tag_name: String,
          tag_id: String,
          type: {
            type: Number
          }
        }
      ],
      tag_id: [String],
      remark_corp_name: String,
      remark_mobiles: [String],
      add_way: Number,
      oper_userid: String,
      state: String
    }
  ]
}, {_id: false});

// customerDetails.index({'external_contact.external_userid': 1}, {unique: true, background: true})
const CustomerDetails = mongoose.model('CustomerDetails', customerDetails);

export default CustomerDetails;
