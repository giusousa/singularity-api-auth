const error = require('./error');

module.exports = (req, res, policy) => {

    const { level } = req.userData;

    const levelAuth = policy.find(v => level === v)
    if (!levelAuth) {
        error(req, res, 'Your level cannot access this route')
        return
    }
    return true
};