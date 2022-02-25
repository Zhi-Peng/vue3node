import mongoose from 'mongoose'
import chalk from 'chalk';

mongoose.connect('mongodb://localhost/user', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
mongoose.Promise = global.Promise

const db = mongoose.connection

db.once('open', () => {
  // console.log(chalk.green('data ----'))
  console.log(chalk.green('连接数据库成功'))
})

db.on('error', error => {
  console.log(chalk.red('Error in MongoDb connection: ' + error));
})

db.on('clone', () => {
  console.log(chalk.red('数据库断开，重新连接数据库'));
  const db = mongoose.connect('mongodb://localhost/user', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
})

export default db