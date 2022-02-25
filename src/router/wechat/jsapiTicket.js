import request from 'request-promise';
import ticketSchema from '../../models/jsapiTicket/index.js';

const baseUrl = 'https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=';
class Ticket {
  async requestTicket (access_token) {
    const data = await request({
      // 这里要获取 token
      url: `${baseUrl}${access_token}`,
      json: true
    });
    return data
  }

  async fetchTicket (access_token) {
    let data = await ticketSchema.getTicket();
    
    if (!this.isValidTicket(data)) {
      data = await this.updateTicket(access_token);
    }

    return data;
  }
  
  async updateTicket (access_token) {
    const ticket = await this.requestTicket(access_token);
    const data = await ticketSchema.saveTicket(ticket);
    return data;
  }

  isValidTicket (data) {
    if (!data || !data.ticket || !data.expires_in) {
      return false 
    }

    const expiresIn = data.expires_in
    const now = (new Date() - data.meta.updated) / 1000;

    return now < expiresIn;
  }
}

export default Ticket;