export default {
  $eatch (array, fn) {
    let len = array.length
    while (len) {
      len--
      fn(array[len])
    }
  },

  $getClientIP (ctx) {
    let req = ctx.request;
    let ip = ctx.ip ||
      req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress || '';
    let arr = ip.match(/(\d{1,3}\.){3}\d{1,3}/);

    return arr ? arr[0] : ''
  },


  $readStream (ctx) {
    return new Promise((resolve) => {
      let data = '';
      ctx.req.on('data', (chunk) => {
        data += chunk;
      });
      ctx.req.on('end', () => {
        resolve(data);
      })
    })
  }
}