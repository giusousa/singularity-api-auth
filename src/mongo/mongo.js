const mongoose = require('mongoose')
require('dotenv').config();


mongoose.Promisse = global.Promisse
mongoose.set('useFindAndModify', false);

const DB = `MONGODB_${process.env.NODE_ENV}`

mongoose.connect(process.env[DB], {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then( ()=>{
  //console.log("connected")
},
  err => {console.log("err",err);
});

mongoose.connection.on('connected', () => {
  console.log('Mongo has connected succesfully')
})
mongoose.connection.on('reconnected', () => {
  console.log('Mongo has reconnected')
})
mongoose.connection.on('error', error => {
  console.log('Mongo connection has an error', error)
  mongoose.disconnect()
})
mongoose.connection.on('disconnected', () => {
  console.log('Mongo connection is disconnected')
})

module.exports = mongoose