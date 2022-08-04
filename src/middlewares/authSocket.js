const authConfig = require('../config/auth.json')
const jwt = require('jsonwebtoken');

module.exports = (socket, next) => {
  
    const { cookie } = socket.request.headers
    if(!cookie)
      return next(new Error('Header cookie auth required'));

    const [ authToken ] = cookie.split(' ').filter(string => string.includes('auth_token='))
    
    if (authToken) {

      const token = (() => {
        if (authToken.includes(';'))
          return authToken.substring(11, authToken.length - 1);
        return authToken.substring(11, authToken.length)
      })()

      jwt.verify(token, authConfig[process.env.NODE_ENV], function(err, decoded) {
        if (err) 
          return next(new Error('authentication_error'));
          
        if (decoded.level === 'admin' || decoded.level === 'supermanager')
          return next(new Error('Your level cannot use the socket - level:' + decoded.level ))



        socket.userData = {...decoded, userId: decoded.id, token };
        
        next();
      });
      
    } else {
      next(new Error('authentication_error'));
    };
};