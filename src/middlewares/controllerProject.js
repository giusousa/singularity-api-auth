const {mongoIndex, supermanagerApi, error, env, createMongoSchema, getRedisRoute, queryUsersProject, datefns, saveRouteDatabase } = require('./controllerModule');

const authLevel              = require('../controllers/scripts/authLevel')

module.exports = async (req, res, next) => {

    // EVITA QUE USUÁRIOS QUE NÃO FOREM 'admin' || 'supermanager' ACESSEM ROTAS DE OUTRO PROJETO.
    if (req.userData && (req.userData.level !== 'admin' && req.userData.level !== 'supermanager') && req.userData.projectId !== req.projectData._id)
        return error('You do not have access to the informed project route')

    if (req.routeData.policy && req.routeData.policy[req.method.toLowerCase()]) {
        const auth = authLevel(req, res, req.routeData.policy[req.method.toLowerCase()])
        if (!auth) return 
    }

    const api       = await supermanagerApi(req.projectData.supermanagerId);

    const handleError = (msg, err = '') => {
        error(req, res, msg, err)
    };

    let responseData = {}

    const preDatabase = req.routeData.preDatabase
    if (!preDatabase || !preDatabase[req.method.toLowerCase()])
        return error('preDatabase function invalid')

    try {
        await eval(preDatabase[req.method.toLowerCase()])()
        
    } catch (err) {
       return error(req, res, `Function preDatabase Project: ${req.routeData.url} || Method: ${req.method} || Error:`, err)
    }

    return res.send(responseData)
};