import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    id: Number,
    name: String,
    email: String,
    password: String,
    phone: String,
    roleType: Number,
    createTime: {
      type: Date,
      default: Date.now
    },
    updateTime: {
      type: Date,
      default: Date.now
    }
  },
  {
    // 表示要不要数据库里面的 ——v这个字段
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  }
);

// userSchema.index({id: 1});

const User = mongoose.model('User', userSchema);

export default User;
