const schema    = require('../mongo/project');
const Mongo     = require('./scripts/mongo');
const authLevel = require('./scripts/authLevel');

module.exports = {

    async create(req, res, next) {
 
        const policy = ['supermanager']
        const auth = authLevel(req, res, policy)
        if (!auth) return

        req.body.supermanagerId = req.userData._id
        req.body.statusAdmin = true;

        const response = await Mongo.create(res, schema, req.body);

        return res.send(response);
    },

    async index(req, res, next) {

        const policy = ['admin', 'supermanager']
        const auth = authLevel(req, res, policy)
        if (!auth) return

        if (req.userData.level === 'supermanager') 
            req.query.supermanagerId = req.userData._id

        const response = await Mongo.index(res, schema, req.query)
        return res.send(response);
    },

    async edit(req, res, next) {
        
        const policy = ['admin', 'supermanager']
        const auth = authLevel(req, res, policy)
        if (!auth) return

        if (req.userData.level === 'supermanager') {
            req.query.supermanagerId = req.userData._id
            delete req.body.statusAdmin;
        }

        const redisId   = req.body._id
        await Mongo.edit(res, true, schema, req.body, req.query, redisId);
    },

    async delete(req, res, next) {

        const policy = ['admin', 'supermanager']
        const auth = authLevel(req, res, policy)
        if (!auth) return

        if (req.userData.level === 'supermanager') 
            req.query.supermanagerId = req.userData._id

        const redisId   = req.query._id;
        await Mongo.delete(res, true, schema, req.query, redisId);
    },
};