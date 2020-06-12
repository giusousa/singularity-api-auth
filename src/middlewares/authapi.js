const projectConfig = require('../config/project.json')

module.exports = async (req, res, next) => {

    const { token, intent } = req.query;
    const project 	= req.params[0];

    const proj = projectConfig.find(({name}) => name == project);

    if (!proj || proj.token != token)
        return res.status(400).send({error: 'Project or token incorrect'})

    if (req.query.info)
        req.info = JSON.parse(req.query.info);

    req.token       = token;
    req.project     = proj;
    req.intent      = intent;

    next();
};
