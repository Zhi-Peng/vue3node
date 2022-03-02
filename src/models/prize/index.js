import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * post方法，对应post请求
 * @param prize_name [奖品名字]
 * @param prize_num [奖品的量]
 * @param remain_num [奖品剩余的量]
 * @param prize_ratio [中奖概率]
 * @param time_begin [活动开始时间]
 * @param time_end [活动结束时间]
 * @param img [奖品图片]
 * @param type [奖品类型]
 */
const prizeSchema = new Schema({
  id: Number,
  prize_name: String,
  prize_num: Number,
  remain_num: Number,
  prize_ratio: Number,
  time_begin: Date,
  time_end: Date,
  img: String,
  type: Number
});

const Prize = mongoose.model('Prize', prizeSchema);

export default Prize;
