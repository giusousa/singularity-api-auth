const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json')
require('dotenv').config();

module.exports = async (req, res, next) => {

    const auth_cookie = req.cookies.auth_token    || req.cookies.Auth_token
    const authHeader  = req.headers.authorization || req.headers.Authorization;

    if (!auth_cookie && !authHeader) 
        return res.status(401).send ({ error: 'No token provided' })

    let token = auth_cookie || authHeader;

    if (authHeader) {

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
