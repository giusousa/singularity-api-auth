const express = require('express');     // Importa o módulo 'express' para a váriavel 'express'
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const routes = require('./routes');


const app = express();                  // Cria uma variável para armazenar a aplicação (instanciar a aplicação)

app.use(cookieParser());
app.use(cors({
    origin: false,
    //credentials: true
}));
app.use(express.json());                // Informa ao express que usaremos Json nas requisições ao servidor
app.use(routes);                        // Faz com que o app utilize um arquivo externo que contem as rotas disponíveis
app.use(errors());
             
module.exports = app;