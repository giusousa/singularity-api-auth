const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth')

module.exports = function generateToken(params = {}) {

    const {maxAge, ...rest } = params
    return jwt.sign(rest, authConfig[process.env.NODE_ENV], {
        expiresIn: maxAge,
    });

};