// 部门
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const departmentList = new Schema({
  _id: Number,
  id: Number,
  name: String,
  name_en: String,
  parentid: Number,
  order: Number
});

const DepartmentList = mongoose.model('Department', departmentList);

export default DepartmentList;
