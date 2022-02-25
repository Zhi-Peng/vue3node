// 标签下面的成员列表
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tagMemberList = new Schema({
  _id: String,
  tagname: String,
  userlist: [
    {
      userid: String,
      name: String
    }
  ],
  partylist: [Number]
}, {
  _id: false
});

const TagMemberList = mongoose.model('TagMemberList', tagMemberList);

export default TagMemberList;
