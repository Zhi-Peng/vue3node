// 获取配置了客户联系功能的成员列表
import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const externalcontact = new Schema({
  _id: false,
  follow_user: [String]
})

const Externalcontact = mongoose.model('Externalcontact', externalcontact);

export default Externalcontact