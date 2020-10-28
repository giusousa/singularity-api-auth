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
        const emailParse = String(body.email).toLowerCase().trim();
        body.email = emailParse
        
        try {

            /** Verifica se aquele e-mail já possui cadastro */
            /** 'admin' e 'supermanager' precisam ter e-mail únicos no sistema */
            /** 'manager' por ter um mesmo e-mail cadastrado em vários projetos */
            /** 'superuser', 'user' e 'client' podem ter o mesmo e-mail cadastrado em vários grupos do mesmo projeto */
            const query = { email: emailParse, project, managerId };
            if (registerLevel === 'manager') 
                delete query.managerId
            if (registerLevel === 'supermanager' || registerLevel === 'admin')
                delete query.project

            if (await schema.findOne(query))
                return res.status(400).send({ error: 'User already exists'});

            /** Caso o usuário seja um 'manager', ele deve informar um nome para sua organização */
            /** Se não informado, este campo será salvo automáticamente com o nome dele */
            if (registerLevel === 'manager' && !body.managerName)
                body.managerName = body.name;

            const dataCreate = await Mongo.create(res, schema, body);
            const { _id } = dataCreate;
            // Se o usuário que está sendo cadastrado for um manager, o 'managerId' é o seu próprio ID
            if (registerLevel == 'manager') {
                await schema.findOneAndUpdate({ _id }, {
                    '$set': { managerId: _id}
                });
                dataCreate.managerId = _id
            }
            delete dataCreate._doc.password;
            delete dataCreate._doc.secrets;

            return res.send(dataCreate);

        } catch(err) {

            return res.status(400).send({ error: 'Erro User Controller'});
        };

    },

    async index(req, res) {

        const { project, level, managerId, stores = [], query } = req;
        
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