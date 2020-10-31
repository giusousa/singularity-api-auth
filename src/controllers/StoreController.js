const schema = require('../mongo/store');
const Mongo = require('./scripts/mongo');

function formateBody (body) {
    const { attributes, ...rest } = body;
    const newBody = { ...rest };
    Object.keys(attributes).map(prop =>  newBody['attributes.'+prop] = attributes[prop] );
    return newBody
};

module.exports = {

    async create(req, res) {
        const { project } = req;
        req.body.project = project;
        
        return res.send(await Mongo.create(res, schema, req.body));
    },
    async index(req, res) {
        res.send(await Mongo.index(res, schema, req.query));
    },
    async edit(req, res) {
        const newBody = req.body.attributes ? formateBody(req.body) : req.body;
        res.send(await Mongo.edit(res, schema, newBody, req.query));
    },
    async delete(req, res) {
        await Mongo.delete(res, schema, req.query);
    },
};