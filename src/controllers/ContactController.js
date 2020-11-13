const schema = require('../mongo/contact');
const schemaStore = require('../mongo/store');
const schemaUser = require('../mongo/user');

const Mongo = require('./scripts/mongo');
const formateBody = require('./scripts/formatBody');
const authContact = require('./scripts/authContact');


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

        const auth = await authContact(req, res, body._id);
        if (!auth) return 

        const reponse = await Mongo.edit(res, schema, newBody, query)
        res.send(reponse);
    },
    async delete(req, res) {
        const { query } = req;
        const auth = await authContact(req, res, query._id);
        if (!auth) return 

        Mongo.delete(res, schema, req.query);
    },
    
};