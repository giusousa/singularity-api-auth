const { getRedis } = require('../services/redis');

module.exports = async (req, res, next) => {
 
    const url 		 	= req.url.split('/')[2].split('?')[0];
    const projectId     = req.query.projectId

    if (!projectId)
        return res.status(400).send({error: 'Query projectId required'})

    const project = await getRedis(projectId, 'project');

    if (!project)
        return res.status(400).send({error: 'Project not found'})  

    const routeId = projectId + '/' + url;
    const route = await getRedis(routeId, 'route');
    
    if(!route)
        return res.status(400).send({error: 'Route not found'})


    if(!route.methods.includes(req.method.toLowerCase()))
        return res.status(400).send({error: 'Method disablet'})

    req.routeData = route;
    req.projectData = project;

    next()
};