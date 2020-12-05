const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');
require('dotenv').config();

module.exports = async (req, res, next) => {

    if (req.routeData && (!req.routeData.policy || !req.routeData.policy[req.method.toLowerCase()] || req.routeData.policy[req.method.toLowerCase()].length === 0))
        return next()
        
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
    
    jwt.verify(token, authConfig.secret, async (err, decoded ) => {

        if (err) 
            return res.status(401).send({ error: 'Token invalid'})
        // Informações descriptografadas do token
        req.userData = decoded;
        
        return next();
    });

};
