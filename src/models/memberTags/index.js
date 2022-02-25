// 获取标签列表
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tags = new Schema({
  _id: Number,
  tagid: Number,
  tagname: String
});

const Tags = mongoose.model('Tags', tags);

export default Tags;