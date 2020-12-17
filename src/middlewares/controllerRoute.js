const { getRedis, error, env } = require('./controllerModule');
const schemaModel   = require('../mongo/model')
const Mongo          = require('../controllers/scripts/mongo');
const {Socket}      = require('../services/socket');

module.exports = async (req, res, next) => {

    // Cria um esquema mongo de acordo com a rota informada
    const createMongoSchema = async (routeData) => {
        // Schema mongo onde as informações desta url são salvas. 
        if(!routeData)
            routeData = req.routeData

        if (!routeData.modelDb)
            routeData.modelDb ={}
        // Adiciona os campos projectId e managerId->(Se for o caso) por padrão a todos os modelos.
        const modelDb = {...routeData.modelDb , projectId: 'String', creatorId: 'String'}
        
        if (req.projectData.managerWorkspace) 
            modelDb.managerId = 'String' 

        const schemaName = routeData.projectId + '/' + routeData.url
        const schema = await schemaModel(schemaName, modelDb);
        return schema

    };
    // Schema mongo padrão da rota que está sendo utilizada
    const schemaMongoDefault = await createMongoSchema();

    // Baixa os dados de uma outra rota do projeto da memória Redis
    const getRedisRouteProject = async (url) => {
        if (url === req.routeData.url)
            return req.routeData
        const redisId = req.projectData._id + '/' + url;
        const data     = await getRedis(redisId, 'route')
        const schema   = await createMongoSchema(data);
        return { data, schema }
    };

    // Utilizado para fazer o download de alguma informação do Redis
    const getRedisItemProject = async (url, _id) => {
        const { data, schema } = await getRedisRouteProject(url);
        const schemaName = data.projectId + '/' + data.url + '/' + _id
        return  await getRedis(schemaName , schema)
    };

    const handleError = (msg, err = '') => {
        error(req, res, msg, err)
    };

    // FUNÇÕES PRÉ E PÓS A OPERAÇÃO NA DATABASE
    const preDatabase = req.routeData.preDatabase ? req.routeData.preDatabase[req.method.toLowerCase()] : undefined;
    const posDatabase = req.routeData.posDatabase ? req.routeData.posDatabase[req.method.toLowerCase()] : undefined;

    if (preDatabase && preDatabase.trim().length > 0) {
        try {
            const response = await eval(preDatabase)(req, res, next);
            if (response === false  ) return  
        } catch (err) {
            return error(req, res, `Function preDatabase Route: ${req.routeData.url} || Method: ${req.method} || Error:`, err)
        }
    };
    
    const databaseResponse = await (async () => {

        if (req.method === 'POST') {

            if (req.projectData.managerWorkspace)
                req.body.managerId = req.userData.managerId || req.routeData.managerId;

            req.body.projectId = req.projectData._id
            req.body.creatorId = req.userData._id
            
            return await Mongo.create(res, schemaMongoDefault, req.body);
            
        }
            
        if (req.projectData.managerWorkspace && req.userData.level !== 'supermanager')
            req.query.managerId = req.userData.managerId;

        if (req.method === 'GET')
            return await Mongo.index(res, schemaMongoDefault, req.query)

        const itemId = req.query._id || req.body._id;
        const redisId= req.routeData.schemaName + '/' + itemId;
        const redis =  req.projectData.redis ? redisId : undefined;

        if (req.method === 'PUT')
            return await Mongo.edit(res, false, schemaMongoDefault, req.body, req.query, redis)
            
        if (req.method === 'DELETE')
            return await Mongo.delete(res, false, schemaMongoDefault, req.query, redis)
    })();

    if (!databaseResponse)
        return

    if (posDatabase && posDatabase.trim().length > 0) {
        try {
            const response = await eval(posDatabase)(req, res, next);
            if (response === false  ) return  
        } catch (err) {
            return error(req, res, 'Function posDatabase Route error:', err)
        }
    };

    const socketMethods = req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE'

    if (req.routeData.socket && socketMethods) {
        const data = {...databaseResponse, url: req.routeData.url}
        Socket['emit' + req.method](data);
    }

    return res.send(databaseResponse);
};