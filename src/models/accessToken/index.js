import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AccessToken = new Schema({
  name: String,
  access_token: String,
  expires_in: Number,
  meta: {
    created: {
      type: Date, 
      default: Date.now()
    },
    updated: {
      type: Date,
      default: Date.now()
    }
  }
});

AccessToken.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
});

AccessToken.statics = {
  async getAccessToken () {
    const token = await this.findOne({
      name: 'access_token'
    }).exec()

    return token
  },

  async saveAccessToken (data) {
    let token = await this.findOne({
      name: 'access_token'
    }).exec()
    
    
    if (!token) {
      data.name = 'access_token';
      this.isNew = true;
      data = await this.create(data);
    } else {
      const params = {
        name: 'access_token',
        access_token: data.access_token,
        expires_in: data.expires_in,
        meta: {
          updated: Date.now()
        }
      };
      data = await this.updateOne(params)
    }

    return data
  }
}

const accessToken = mongoose.model('AccessToken', AccessToken);
export default accessToken;