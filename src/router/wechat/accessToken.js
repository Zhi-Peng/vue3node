import request from 'request-promise';
import accessTokenSchema from '../../models/accessToken/index.js';

const baseUrl = 'https://qyapi.weixin.qq.com/cgi-bin/';
class Wechat {
  constructor (options) {
    this.aorpid = options.aorpid;
    this.corpsecret = options.corpsecret;
  }

  async requestAccessToken () {
    const data = await request({
      url: `${baseUrl}gettoken?corpid=${this.aorpid}&corpsecret=${this.corpsecret}`,
      json: true
    });
    return data
  }

  async fetchAccessToken () {
    let data = await accessTokenSchema.getAccessToken();
    
    if (!this.isValidAccessToken(data)) {
      data = await this.updateAccessToken();
    }

    return data;
  }
  
  async updateAccessToken () {
    const token = await this.requestAccessToken();
    // const token = {
    //   access_token: 'YNuoARwWF9-UvZVvJ6E3hoqqI15Fhvl5P2W5OfuFO4vsqKjehsj0vw6yPHaTxLnWG5VUfOuFRAfZlSET58DiccGQu04-78H9QMkhFve-si6B804DW0U-EBulKe9-d1gelznXCySYbwkAceaRSuD0Sxg2aQ-1r6jNJ_P9D5BMfIZzk24H7bwW1fTuFfohofmKQzvlf9pbC4WP6o9x72iT_Q',
    //   expires_in: 7200,
    //   name: 'access_token',
    // }
    const data = await accessTokenSchema.saveAccessToken(token);
    return data;
  }

  isValidAccessToken (data) {
    if (!data || !data.access_token || !data.expires_in) {
      return false 
    }

    const expiresIn = data.expires_in
    const now = (new Date() - data.meta.updated) / 1000;

    return now < expiresIn;
  }
}

export default Wechat;