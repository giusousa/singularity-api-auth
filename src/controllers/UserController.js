const schema = require('../mongo/user');
const Mongo = require('./scripts/mongo');
const permission = require('../config/permission.json')

function formateBody (body) {
    const { attributes, ...rest } = body;
    const newBody = { ...rest };
    Object.keys(attributes).map(prop =>  newBody['attributes.'+prop] = attributes[prop] );
    return newBody
};

module.exports = {

    async create(req, res) {

        const { body, userId, project, level } = req;
        // level do usuário que será cadastrado
        const {level: registerLevel, email, managerId = 'admin'}     = body;
        
        const superUser = (level == 'admin' || level == 'supermanager')
        if (!superUser)
            delete body.secrets

        body.creatorId = userId;

        // O projeto de um 'admin' sempre é 'auth
        // O projeto de um 'supermanager' é definido pela url da requisição
        // O projeto dos demais é definido pelo projeto do seu criador 
        body.project = 
            registerLevel == 'admin' 
                ? 'auth' 
                : registerLevel == 'supermanager'
                    ? req.params[0]
                    : project;

        body.managerId = managerId;

        try {
            if (await schema.findOne({ email, managerId }))
                return res.status(400).send({ error: 'User already exists'});

            const dataCreate = await Mongo.create(res, schema, body).lean();
            const { _id } = dataCreate;
            // Se o usuário que está sendo cadastrado for um manager, o 'managerId' é o seu próprio ID
            if (registerLevel == 'manager') {
                await schema.findOneAndUpdate({ _id }, {
                    '$set': { managerId: _id}
                });
                dataCreate.managerId = _id
            }
            delete dataCreate.password;
            delete dataCreate.secrets;
            return res.send(dataCreate);

        } catch(err) {

            return res.status(400).send({ error: 'Erro User Controller'});
        };

    },

    async index(req, res) {

        const { project, level, managerId, stores, query } = req;
        // (supermanager) pode acessar usuário de todos os níveis do seu projeto
        if (level == 'supermanager') {
            query.project = project
        // Outros usuários podem acessar apenas usuários com o mesmo 'managerId' e
        // que seja de level inferior.
        } else {
            query.managerId = managerId
            
            if (query.level && !permission[level].control.includes(query.level)) 
                return res.status(400).send({ error: 'Erro. Você não tem acesso ao level solicitado'});
            if (!query.level)
                query.level = {$in: permission[level].control}

        };

        // 'superuser' e 'user' podem listar apenas usuários de suas lojas
        if (level == 'superuser' || level == 'user') {
            if (stores.length === 0)
                return res.status(400).send({ error: 'Erro. 0 stores registers in user'});
            // Caso o usuário faça parte de pelo menos 1 loja
            // Buscar usuários que façam parte de uma de suas lojas
            query.$or  = [];
            stores.map(_id =>  query.$or.push({stores: _id}) )
        }

        res.send(await Mongo.index(res, schema, query, '-secrets'));
    },

    async edit(req, res) {
        
        const { body, userId, level } = req;
        const superUser = (level == 'admin' || level == 'supermanager')
        
        // Se o usuário estiver tentando atualizar seu próprio cadastro
        if (userId === body._id) {
            delete body.level              
            delete body.stores            
        }
        if (!superUser)
            delete body.secrets

        const newBody = req.body.attributes ? formateBody(req.body) : req.body;
        res.send(await Mongo.edit(res, schema, newBody, req.query));

    },

    async delete(req, res) {
        await Mongo.delete(res, schema, req.query);
    },
};