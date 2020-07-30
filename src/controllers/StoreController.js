const schema = require('../mongo/store');
const Mongo = require('./scripts/mongo');

module.exports = {

    async create(req, res) {
        return res.send(await Mongo.create(res, schema, req.body));
    },
    async index(req, res) {
        res.send(await Mongo.index(res, schema, req.query));
    },
    async edit(req, res) {
        res.send(await Mongo.edit(res, schema, req.body, req.query));
    },
    async delete(req, res) {
        await Mongo.delete(res, schema, req.query);
    },
};