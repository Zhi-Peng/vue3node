import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const emailSchema = new Schema(
  {
    id: Number,
    email: String,
    code: String
  },
  {
    timestamps: {
      createAt: {
        type: Date,
        default: Date.now,
        // 秒为单位
        index: { type: -1, expires: 3600 }
      }
    }
  }
);

const Email = mongoose.model('Email', emailSchema);

export default Email;
