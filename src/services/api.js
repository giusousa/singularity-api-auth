const axios = require('axios') ;

const port = process.env['PORT_' + process.env.NODE_ENV]

module.exports = axios.create({
    baseURL: `http://localhost:${port}/`
})
