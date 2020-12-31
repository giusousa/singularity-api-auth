const url       = 'route'
const schema    = require('../mongo/index')[url];
const Mongo     = require('./scripts/mongo');
const {clearModel}=require('../mongo/model');
const authLevel = require('./scripts/authLevel');
const {getRedis, setRedis}= require('../services/redis');
const error     = require('./scripts/error');

module.exports = {

    async create(req, res, next) {

        const policy = ['supermanager']
        const auth = authLevel(req, res, policy)
        if (!auth) return

        const project = await getRedis(req.body.projectId, 'project');

        if (!project)
            return error(req, res, 'projectId not found');
     
        if (project.supermanagerId !== req.userData._id)
            return error(req, res, 'It is not possible to access other supermanager projects');

        const route = await schema.findOne({url: req.body.url, projectId: req.body.projectId});
        if (route)
            return error(req, res, 'This route already exists');

        req.body.supermanagerId = req.userData._id;
  
        const response = await Mongo.create(res, schema, req.body);

        return res.send(response);
    },

    async index(req, res, next) {

        const policy = ['supermanager']
        const auth = authLevel(req, res, policy)
        if (!auth) return

        req.query.supermanagerId = req.userData._id
        
        const response = await Mongo.index(res, schema, req.query)
        return res.send(response);
    },

    async edit(req, res, next) {
        
        const policy = ['supermanager']
        const auth = authLevel(req, res, policy)
        if (!auth) return

        req.query.supermanagerId = req.userData._id

        const route         = await schema.findById(req.body._id).select('projectId url').lean()
        if (!route)
            return error(req, res, 'route _id not found');

        const redisId	    = route.projectId+'/'+ route.url;

        await Mongo.edit(res, true, schema, req.body, req.query, redisId);

        // Sempre houver uma atualização, o schema Mongo armazenado em cache será deletado
        // Na próxima vez que for necessário, o arquivo será compilado e salvo aut. em cache novamente
        clearModel(redisId)
    },

    async delete(req, res, next) {

        const policy = ['supermanager']
        const auth = authLevel(req, res, policy)
        if (!auth) return

        req.query.supermanagerId = req.userData._id

        const route         = await schema.findById(req.query._id).select('projectId url').lean()
        if (!route)
            return error(req, res, 'route _id not found');

        const redisId	    = route.projectId+'/'+ route.url;
    
        await Mongo.delete(res, true, schema, req.query, redisId);

        // Sempre houver uma atualização, o schema Mongo armazenado em cache será deletado
        // Na próxima vez que for necessário, o arquivo será compilado e salvo aut. em cache novamente
        clearModel(redisId);
    },
};