const schema = require('../mongo/message');
const schemaContact = require('../mongo/contact');
const schemaUser    = require('../mongo/user');

const Mongo = require('./scripts/mongo');

function formateBody (body) {
    const { attributes, ...rest } = body;
    const newBody = { ...rest };
    Object.keys(attributes).map(prop =>  newBody['attributes.'+prop] = attributes[prop] );
    return newBody
};

async function auth( req, res) {
    const { userId, level, project, stores, body, query, method } = req;

    try {

        const contact = await schemaContact.findById(body.contactId)
            .select('group project storeId managerId')
            .lean()

        if (!contact)
            return res.status(400).send({error: 'document Id not found'})

        const { group, storeId, managerId } = contact
    
        // O usuário está no grupo de membros participantes deste CONTACT
        const groupIncludes = group.filter(v => v.userId === userId);
        // O usuário possui acesso a loja || é 'manager' da loja que deste CONTACT 
        const storeIncludes = storeId && ((stores.includes(storeId) && level === 'superuser') || managerId === userId);
        // O usuário é 'supermanager' do projeto
        const projectIncludes = contact.project && level === 'supermanager' && project === contact.project;
    
        if (groupIncludes)
            return true

        const {name} = await schemaUser.findById(userId)
            .select('name')
            .lean()

        return name

    } catch (err) {
        console.log(err)
        return res.status(400).send({error: `Error Database - route: message | err:` + err}) 
    }

    return  res.status(400).send({error: `Denied access - route: message | method: ${method}`}) 

};

module.exports = {

    async create(req, res) {

        req.body.userId = req.userId;

        const name = await auth(req, res)
        console.log(name)

        if (typeof name === 'string')
            req.body.userName = name

        const reponse = await Mongo.create(res, schema, req.body)
        return res.send(reponse);

    },
    async index(req, res) {
        const {level, userId, project, stores, query} = req;

        try {

            const contact = await schemaContact.findById(query.contactId)
                .select('_id group managerId storeId project')
                .lean()

            if (!contact)
                return res.status(400).send({error: `'contactId' not found`})

            const test1 = contact.group.find(({ userId: userIdGroup }) => userIdGroup === userId)
            const test2 = (level === 'manager' && contact.managerId === userId) || (level === 'superuser' && stores.includes(contact.storeId))
            const test3 = level === 'supermanager' && contact.project === project

            if (!test1 && !test2 && !test3)
                return res.status(400).send({error: `Denied access - route: message - contactId ${contact._id}`})
        
        } catch (err) {
            return res.status(400).send({ error: 'index database fail - err:' + err })
        }

        const reponse = await Mongo.index(res, schema, query)
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