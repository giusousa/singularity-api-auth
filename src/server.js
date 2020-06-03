const app = require('./app')

const port = process.env.NODE_ENV == 'DEV' ? 3333 : 8080

app.listen(port);