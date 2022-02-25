import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const userSchema = new Schema({
	id: Number,
  userName: String,
  userEmail: String,
  password: String,
  phone: String,
  token: String
})

// userSchema.index({id: 1});

const User = mongoose.model('User', userSchema);

export default User