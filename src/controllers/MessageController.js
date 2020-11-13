const schema = require('../mongo/message');
const schemaContact = require('../mongo/contact');
const schemaUser    = require('../mongo/user');

const Mongo = require('./scripts/mongo');
const formateBody = require('./scripts/formatBody');
const authContact = require('./scripts/authContact');

module.exports = {

    async create(req, res) {

        const { userId, level, project, stores, body, query, method } = req;

        const auth = await authContact(req, res, body.contactId);
        if (!auth) return 
        
        if (!auth.groupIncludes)  {
            try {
                const data = await schemaUser.findById(userId)
                    .select('name')
                    .lean()

                req.body.userName = data.name
            } catch (err) {
                //console.log(err)
                return res.status(400).send({error: `Database error - route: message | method: ${method}`}) 
            };
        };

        req.body.userId = userId;
        req.body.usersGet= [userId];
        req.body.usersView=[userId];

        const reponse = await Mongo.create(res, schema, req.body)
        return res.send(reponse);
        
    },
    async index(req, res) {
        const {level, userId, project, stores, query} = req;

        const auth = await authContact(req, res, query.contactId);
        if (!auth) return 

        const reponse = await Mongo.index(res, schema, query)
        res.send(reponse);
    },
    async edit(req, res) {
        const { body, query, userId } = req;
        const newBody = body.attributes ? formateBody(body) : body;

        try {
            const {contactId, usersGet = [], usersView = []} = await schema.findById(body._id)
                .select('contactId usersGet usersView')
                .lean()

            const auth = await authContact(req, res, contactId);
            if (!auth) return 

            if (newBody.usersGet)
                newBody.usersGet = [...new Set([...usersGet, userId])]

            if (newBody.usersView)
                newBody.usersView = [...new Set([...usersView, userId])]


        } catch (err) {
            return res.status(400).send({error: `Error Database | err:` + err})
        };

        const reponse = await Mongo.edit(res, schema, newBody, query);
        res.send(reponse);
    },
    async delete(req, res) {
        try {
            const document = await schema.findById(req.query._id)
                .select('userId')
                .lean()
            if (!document)
                return res.status(400).send({error: `_id not found`})

            if (document.userId === req.userId)
                return Mongo.delete(res, schema, req.query);
        } catch (err) {
            return res.status(400).send({ error: 'delete database fail - err:' + err })
        }

        return res.status(400).send({error: `Denied access - route: message | method: ${req.method}`})
    },
};