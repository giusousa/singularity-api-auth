const express = require('express');     // Importa o módulo 'express' para a váriavel 'express'
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const routes = require('./routes');
const qs = require('./middlewares/qs');

const app = express();                  // Cria uma variável para armazenar a aplicação (instanciar a aplicação)

// O cors limita quais domínios (front-end) podem acessar a Api

// Utilizado quando quem está acionando esta API é um navegador.
// O CORS permite que um site acesse recursos de um servidor que esteja em um domínio diferente.
app.use(cors({
    origin: ['http://localhost:3000', 'https://boimanso-frontend-7scc3zwlma-uc.a.run.app'],
    credentials: true
}));


app.use(cookieParser());
app.use(express.json());                // Informa ao express que usaremos Json nas requisições ao servidor
app.use(qs);                            // Permite que a API aceite arrays e objetos por query
app.use(routes);                        // Faz com que o app utilize um arquivo externo que contem as rotas disponíveis
app.use(errors());                      // Tratamento de erros referentes ao celebrate
             
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) return res.status(400).send(JSON.stringify({
        error: "Invalid JSON"
    }))
    console.error(err);
    res.status(500).send();
});

app.enable('trust proxy');             // But this ensures the request IP matches the client and not the load-balancer

module.exports = app;