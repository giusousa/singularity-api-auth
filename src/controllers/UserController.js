const schema = require('../mongo/user');
const Mongo = require('./scripts/mongo');
const permission = require('../config/permission.json')

module.exports = {

    async create(req, res) {

        const { body, userId, project } = req;
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

            const dataCreate = await Mongo.create(res, schema, body);
            const { _id } = dataCreate;
            // Se o usuário que está sendo cadastrado for um manager, o 'managerId' é o seu próprio ID
            if (registerLevel == 'manager') {
                await schema.findOneAndUpdate({ _id }, {
                    '$set': { managerId: _id}
                });
                dataCreate.managerId = _id
            }

            dataCreate.password = undefined
            dataCreate.secrets = undefined

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
            query.level = {$in: permission[level].control}
        }
        
        // 'superuser' e 'user' podem listar apenas usuários de suas lojas
        if (level == 'superuser' || level == 'user') {
            if (stores.length === 0)
                return res.status(400).send({ error: 'Erro. 0 stores registers in user'});
            // Caso o usuário faça parte de pelo menos 1 loja
            // Buscar usuários que façam parte de uma de suas lojas
            query.$or  = [];
            stores.map(_id =>  query.$or.push({_id}) )
        }
        query.secrets = undefined;
        res.send(await Mongo.index(res, schema, query));
    },

    async edit(req, res) {
        
        const { body, userId } = req;
        const superUser = (level == 'admin' || level == 'supermanager')
        
        // Se o usuário estiver tentando atualizar seu próprio cadastro
        if (userId === body._id) {
            delete body.level              
            delete body.stores            
        }
        if (!superUser)
            delete body.secrets

        res.send(await Mongo.edit(res, schema, body, req.query));
    },

    async delete(req, res) {
        await Mongo.delete(res, schema, req.query);
    },
};