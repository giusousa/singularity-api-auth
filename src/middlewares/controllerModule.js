const mongoIndex    = require('../mongo/index');
const api           = require('../services/api');
const generateToken = require('../utils/generateToken');
const schemaModel   = require('../mongo/model');
const { differenceInDays, subDays, startOfDay, endOfDay }            = require('date-fns')

const{setRedis, getRedis}=require('../services/redis');

const supermanagerApi = (supermanagerId) => {

    const login = async () => {
        try {
            const user  = await mongoIndex.user.findById(supermanagerId).select('name creatorId managerId projectId email level').lean()
            const token = generateToken({ maxAge: 21600000, ...user });
            setRedis('token/'+supermanagerId, token, 18000);
            return token;
        } catch (err) {
            console.log(err.reponse?err.response.data : err)
        };
    }

    api.interceptors.request.use(
        async config => {
            let token = await getRedis('token/'+supermanagerId)
            if (!token) 
                token = await login()
    
            config.headers.authorization = 'Bearer ' + token
            return config
        },
        error => {
            return Promise.reject(error)
        }
    );

    return api
};

const error     = (req, res, msg, err) => {
    console.log(err)
    const msgFormat = (() => {
        if (err.response && err.response.data) 
            return msg + ' ' + err.response.data.error + ' ' + err.response.data.message
        return msg + ' ' + String(err)
    })();
    res.status(400).send({error: msgFormat});
};

// Baixa os dados de uma outra rota do projeto da memória Redis
const getRedisRoute = async (req, url) => {
    const redisId = req.projectData._id + '/' + url;
    const data     = await getRedis(redisId, 'route')
    const schema   = await createMongoSchema(req, data);
    return { data, schema }
};

// Cria um esquema mongo de acordo com a rota informada
const createMongoSchema = async (req, routeData) => {

    if (!routeData.modelDb)
        routeData.modelDb = {}
    // Adiciona os campos projectId e managerId->(Se for o caso) por padrão a todos os modelos.
    const modelDb = {...routeData.modelDb , projectId: 'String', creatorId: 'String'}
    
    if (req.projectData.managerWorkspace) 
        modelDb.managerId = 'String' 

    const schemaName = routeData.projectId + '/' + routeData.url
    const schema = await schemaModel(schemaName, modelDb);
    return schema

};

// Busca usuários de acordo com o projeto. Não permite listar usuários 'admin' || 'supermanager'
const queryUsersProject = async (req, query, select) => {
    
    try {
        query.projectId = req.projectData._id;

        if (query.level && (query.level === 'admin' || query.level === 'supermanager')) 
            return Promise.reject('Level available for query: manager, superuser, user, client');
        
        if (!query.level) 
            query.level     = { $in: ['manager', 'superuser', 'user', 'client']}

        const data = select ? await mongoIndex.user.find(query).select(select) : await mongoIndex.user.find(query);
        return data;
    } catch (err) {
        console.log(err)
    };
};

// Salve data DB
const saveRouteDatabase = async (req, body) => {
    if(!body.managerId || !body.creatorId || !body.projectId)
        return Promise.reject('It is mandatory to inform the fields: projectId, managerId, creatorId');
    const { schema: schemaMongoFunnelHistory}  = await getRedisRoute(req, 'funnelhistory');
    const data = await schemaMongoFunnelHistory.create(body);
    return data
};

module.exports.mongoIndex       = mongoIndex
module.exports.supermanagerApi  = supermanagerApi
module.exports.error            = error
module.exports.getRedis         = getRedis
module.exports.env              = process.env.NODE_ENV
module.exports.getRedisRoute    = getRedisRoute
module.exports.createMongoSchema= createMongoSchema
module.exports.queryUsersProject= queryUsersProject
module.exports.datefns = {differenceInDays, subDays, startOfDay, endOfDay}
module.exports.saveRouteDatabase= saveRouteDatabase