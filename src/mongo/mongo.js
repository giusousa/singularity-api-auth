const mongoose = require('mongoose')
require('dotenv').config();


//mongoose.connect('mongodb://localhost/noderest', { useMongoClient: true })

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


module.exports = mongoose