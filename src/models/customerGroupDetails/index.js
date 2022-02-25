// 所有客户群
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const customerGroupDetails = new Schema({
  _id: String,
  chat_id: String,
  name: String,
  owner: String,
  create_time: Number,
  notice: String,
  member_list: [
    {
      userid: String,
      type: {
        type: Number
      },
      unionid: String,
      join_time: Number,
      join_scene: Number
    }
  ]
}, {
  _id: false
});

const CustomerGroupDetails = mongoose.model('CustomerGroupDetails', customerGroupDetails);

export default CustomerGroupDetails;