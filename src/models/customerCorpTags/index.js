// 所有企业所有标签或标签组
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const customerCorpTags = new Schema({
  group_id: String,
  group_name: String,
  create_time: Number,
  order: Number,
  deleted: Boolean,
  tag: [
    {
      id: String,
      name: String,
      create_time: Number,
      order: Number,
      deleted: Boolean
    }
  ]
}, {
  _id: false
});

const CustomerCorpTags = mongoose.model('CustomerCorpTags', customerCorpTags);

export default CustomerCorpTags;
