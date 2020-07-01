const projectConfig = require('../config/project.json')

/**
 * Cada projeto possui um token que permite acesso a rotas especiais.
 * Esta função verifica se o token enviado está correto.
 */

module.exports = async (req, res, next) => {

    const { authorization } = req.headers;

    const convertUrl    = req.params[0].split('/')
    const projectName   = convertUrl[0]

    const project = projectConfig.find(({name}) => name == projectName);

    if (!project || project.token != authorization)
        return res.status(400).send({error: 'Project or token incorrect'})

    next();
};
