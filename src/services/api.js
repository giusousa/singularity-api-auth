const axios = require('axios') ;
const port = process.env.NODE_ENV == 'DEV' ? 3333 : 8080
console.log(port)
console.log(process.env.NODE_ENV)
module.exports = axios.create({
    baseURL: `http://localhost:${port}/`
})
