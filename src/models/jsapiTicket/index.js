import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Ticket = new Schema({
  name: String,
  ticket: String,
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

Ticket.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
});

Ticket.statics = {
  async getTicket () {
    const ticket = await this.findOne({
      name: 'ticket'
    }).exec()

    return ticket
  },

  async saveTicket (data) {
    let ticket = await this.findOne({
      name: 'ticket'
    }).exec()
    
    
    if (!ticket) {
      data.name = 'ticket';
      this.isNew = true;
      data = await this.create(data);
    } else {
      const params = {
        name: 'ticket',
        ticket: data.ticket,
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

const ticket = mongoose.model('Ticket', Ticket);
export default ticket;