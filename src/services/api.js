const axios = require('axios') ;
const port = process.env.NODE_ENV == 'DEV' ? 3333 : 8080

module.exports = axios.create({
    baseURL: `http://localhost:${port}/`
})
