const { getRedis, setRedis } = require('../services/redis');
const mongoIndex             = require('../mongo/index');
const error                  = require('../controllers/scripts/error');
const authLevel              = require('../controllers/scripts/authLevel')

module.exports = async (req, res, next) => {

    if(req.userData.level === 'admin')
        return error(req, res, 'Your level cannot access project routes. level: ' + req.userData.level);

    // SEMPRE QUE UM USUÁRIO SUPERMANAGER QUISER ACESSAR UMA ROTA DE PROJETO,
    // É NECESSÁRIO INFORMAR QUAL O PROJETO
    if(req.userData.level === 'supermanager' && !req.query.projectId)
        return error(req, res, 'Query projectId required for users supermanager');

    const projectId 	= req.userData.projectId || req.query.projectId;
    const url 		 	= req.url.split('/')[2].split('?')[0];
    const schemaName	= projectId +'/'+ url;

    const route = await getRedis(schemaName, 'route');
    // Caso não exista uma rota válida, retornar erro
    if (!route)
        return error(req, res, 'Route  url not found: ' + url);

    const routeStatus = route.methods.includes(req.method.toLowerCase())
    // Caso o méthodo não esteja ativo
    if (!routeStatus)
        return error(req, res, 'Method url not disablet: ' + url);
        
    if (route.policy && route.policy[req.method.toLowerCase()]) {
        const auth = authLevel(req, res, route.policy[req.method.toLowerCase()])
        if (!auth) return 
    }

    // Verifica se existe um projeto ATIVO com esse ID
    const project = await getRedis(projectId, 'project');
    if (!project)
        return error(req, res, 'Project url not found: ' + projectId);

    if (req.userData.level === 'supermanager' && project.supermanagerId !== req.userData._id)
        return error(req, res, 'You cannot access the project: ' + projectId);

    if (req.userData.level === 'supermanager' && req.method === 'POST' && !req.query.managerId)
        return error(req, res, 'Query managerId required for users supermanager in method POST');

    req.routeData = { schemaName, ...route }
    req.projectData  = project;

    if(req.userData.level === 'supermanager') {
        delete req.query.projectId;

        if (req.method === 'POST') {
            req.routeData.managerId = req.query.managerId;
            delete req.query.managerId;
        }
    }
        
     
    next()
}