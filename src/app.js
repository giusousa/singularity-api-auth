const express = require('express');     // Importa o módulo 'express' para a váriavel 'express'
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const routes = require('./routes');


const app = express();                  // Cria uma variável para armazenar a aplicação (instanciar a aplicação)

app.use(cookieParser());

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
        'https://boimanso-frontend-7scc3zwlma-uc.a.run.app'
    ];

    console.log(origin)

    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

// O cors limita quais domínios podem acessar a Api
app.use(cors(corsOptions));
// Caso tenha ocorrido algum erro com o 'CORS', retornar o erro
app.use(function customErrorHandler(err, req, res, next) {
    res.status(400).send(err.stack.split('(')[0]);
});

app.use(express.json());                // Informa ao express que usaremos Json nas requisições ao servidor
app.use(routes);                        // Faz com que o app utilize um arquivo externo que contem as rotas disponíveis
app.use(errors());
             
module.exports = app;