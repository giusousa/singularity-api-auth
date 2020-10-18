const express = require('express');     // Importa o módulo 'express' para a váriavel 'express'
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const routes = require('./routes');
const app = express();                  // Cria uma variável para armazenar a aplicação (instanciar a aplicação)


const corsOptions = {
  origin: function (origin, callback) {

    const whitelist = [
        'https://easychat-backend-cn4eogsveq-uc.a.run.app',
    ];
    
    console.log(origin)
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin || whitelist.indexOf(origin) !== -1) 
        return callback(null, true);

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  }
};

// O cors limita quais domínios podem acessar a Api
app.use(cors(corsOptions));
// Caso tenha ocorrido algum erro com o 'CORS', retornar o erro
app.use(function customErrorHandler(err, req, res, next) {
    res.status(400).send(err.stack.split('(')[0]);
});


app.use( function (req, res, next) {

    console.log('================')
    console.log(req.get('host'))
    console.log(req.get('origin'))
    console.log('================')
    console.log(req.header('Host'))
    console.log(req.header('Origin'))






    console.log('Time:', Date.now());
    next();
});

app.use(cookieParser());
app.use(express.json());                // Informa ao express que usaremos Json nas requisições ao servidor
app.use(routes);                        // Faz com que o app utilize um arquivo externo que contem as rotas disponíveis
app.use(errors());
             
module.exports = app;