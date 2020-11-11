const schema = require('../mongo/contact');
const schemaStore = require('../mongo/store');
const schemaUser = require('../mongo/user');

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

        const contact = await schema.findById(body._id || query._id)
            .select('group project storeId managerId')
            .lean()

        if (!contact)
            return res.status(400).send({error: 'document Id not found'})

        // O usuário está no grupo de membros participantes deste CONTACT
        const groupIncludes = contact.group.filter(({userId: userIdItem, userName}) => userIdItem === userId);
        // O usuário possui acesso a loja || é 'manager' da loja que deste CONTACT 
        const storeIncludes = contact.storeId && (stores.includes(contact.storeId) || contact.managerId === userId);
        // O usuário é 'supermanager' do projeto
        const projectIncludes = contact.project && level === 'supermanager' && project === contact.project;

        if (groupIncludes || storeIncludes || projectIncludes) 
            return true

    } catch (err) {
        return res.status(400).send({ error: 'index database fail - err:' + err })
    }


    return res.status(400).send({error: `Denied access - route: contact | method: ${method}`})   
};

module.exports = {

    async create(req, res) {
        
        const { userId } = req;
        const { storeId, status } = req.body;
        
        if (status === undefined)
            req.body.status = true;

        // Caso o usuário esteja logado
        userId 
            ? req.body.userId = userId 
            : delete req.body.userId
        
        if (!req.body.group)
            req.body.group = [];

        if (!req.body.group.find(({userId}) => userId === user._id) && req.userId)
            // Inclui a pessoa entre os membros do grupo
            req.body.group.push({userId: userId || null, userName: req.body.userName})

        // Caso o usuário tenha informado uma loja
        if (storeId) {
            const storeSelect = await schemaStore.findById(storeId).select('name managerId').lean();
            const userManager = await schemaUser.findById(storeSelect.managerId).select('name').lean();

            if (!storeSelect)
                return res.status(400).send({error: 'storeId not found'});

            req.body.storeName = storeSelect.name;
            req.body.managerId = storeSelect.managerId;
            req.body.managerName = userManager.name;
        };

        const reponse = await Mongo.create(res, schema, req.body)
        return res.send(reponse);

    },
    async index(req, res) {
        const {level, userId, project, stores} = req;

        req.query.$or = [
            // Usuário está incluso na lista de usuários do grupo
            {group: {$elemMatch: { userId }}},
            // Usuário é um 'manager' da STOREID deste CONTACT
            {managerId: userId},
        ];

        // Usuário é um 'supermanager'. Receberá os arquivos do seu projeto
        if (level === 'supermanager')
            req.query.$or.push({ project });
            
        // Caso o usuário seja um gerente de uma loja
        if (stores && level === 'superuser')
            await stores.map(item => req.query.$or.push({storeId: item}))

        const reponse = await Mongo.index(res, schema, req.query)
        res.send(reponse);
    },
    async edit(req, res) {
        const { body, query } = req;
        const newBody = body.attributes ? formateBody(body) : body;

        await auth(req, res);

        const reponse = await Mongo.edit(res, schema, newBody, query)
        res.send(reponse);
    },
    async delete(req, res) {
        await auth(req, res);
        Mongo.delete(res, schema, req.query);
    },
    
};