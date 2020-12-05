const { celebrate, Segments, Joi } = require('celebrate');
const error = require('../controllers/scripts/error');

module.exports = async (req, res, next) => {
    
    const celebrateSchema = req.routeData.params ? req.routeData.params[req.method.toLowerCase()] : undefined

    if (celebrateSchema && celebrateSchema.trim().length > 0) {

        const evalValidation   = celebrateSchema.slice(0, 10) === 'celebrate('

        if (!evalValidation)
            return error(req, res, 'Schema celebrate invalid');
 
        const celebrateFuncion = eval(celebrateSchema);
        await celebrateFuncion(req, res, next)
    } else {
        next();
    }
    
};