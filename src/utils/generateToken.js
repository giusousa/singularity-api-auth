const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json')

module.exports = function generateToken(params = {}) {

    const {maxAge, ...rest } = params
    return jwt.sign(rest, authConfig.secret, {
        expiresIn: maxAge,
    });

};