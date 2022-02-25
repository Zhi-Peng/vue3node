// 所有客户
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const customerlist = new Schema({
  external_userid: [String]
});

const Customerlist = mongoose.model('Customerlist', customerlist);

export default Customerlist;
