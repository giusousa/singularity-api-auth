const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json')
require('dotenv').config();

module.exports = async (req, res, next) => {

    // PERMITE QUE DETERMINADOS ENDEREÇOS DA WEB POSSAM ACESSAR SEM AUTENTICAÇÃO
    // LISTA DE APIS PERMITIDAS
    const apis = [
        { 
            url: '',
            userId: '5ee2a87fc9aef4256c31b827',
            managerId: 'admin',
            level: 'supermanager',
            project: 'easychat',
            stores: [],
        },
    ]

    const requestedUrl = req
    
    const api = apis.find(({url}) => url === requestedUrl)

    //console.log(requestedUrl)
    console.log(api)

    if (api) {
        req = { ...req, ...api}
        return next()
    };


    const auth_cookie = req.cookies.auth_token
    let token = auth_cookie ? auth_cookie : ''

    if (!auth_cookie) {

        const authHeader = req.headers.authorization;

        if(!authHeader) 
            return res.status(401).send ({ error: 'No token provided' })
    
        const parts = authHeader.split(' ');

        if (!parts.length === 2)  
            return res.status(401).send({ error: 'Token error' })

        const [ scheme, tokenBearer ] = parts;

        if (!/^Bearer$/i.test(scheme))
            return res.status(401).send({ error: 'Token malformatted' })

        if (!tokenBearer)
            return res.status(401).send({ error: 'Token Bearer empty' })  

        token = tokenBearer

    }
    
    
    jwt.verify(token, authConfig.secret, (err, decoded ) => {

        if (err) 
            return res.status(401).send({ error: 'Token invalid'})

        // Informações descriptografadas do token
        req.userId      = decoded.id;
        req.managerId   = decoded.managerId;
        req.level       = decoded.level;
        req.project     = decoded.project;
        req.stores      = decoded.stores;

        return next()
    });

};
