const app = require('./app')
const gracefulShutdown = require('http-graceful-shutdown');

/* Configuração protocolo http */
const server = require('http').createServer(app);
/* Configuração protocolo Websocket */
const { io } = require('./services/socket');

io.attach(server, {path: '/socket'});

const port = process.env.NODE_ENV == 'DEV' ? 3333 : 8080

server.listen(port);

server.on("listening", () => {
    console.log(`Server listening on port: ${port}`)
});

// Handle SIGINT or SIGTERM and drain connections - 
// https://blog.risingstack.com/graceful-shutdown-node-js-kubernetes/
gracefulShutdown(server);