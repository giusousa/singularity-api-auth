const schema = require('../mongo/user');
const generateToken = require('../utils/generateToken');
const permission = require('../config/permission.json')

module.exports = {

    async create(req, res) {

        const body = req.body;
        const { email } = req.body;

        const queryManagerId = req.query.managerId;

        // Informações do usuário autenticado
        const level             = req.level;
        const userId            = req.userId;
        const managerId         = req.managerId;
        const authSuper         = Boolean(level == 'admin' || level == 'supermanager')

        // Informações do usuário que será cadastrado
        const registerLevel     = req.body.level;

        // Se o criador for um usuário Super
        // devera informar qual será o MANAGERID daquele cadastro por uma QUERY
        if (authSuper && !queryManagerId)
            return res.status(400).send({ error: 'need to inform the query: ManagerId'});

        body.creatorId = userId;

        // O projeto de um 'admin' sempre é 'auth
        // O projeto de um 'supermanager' é definido pela url da requisição
        // O projeto dos demais é definido pelo projeto do seu criador 
        body.project = 
            registerLevel == 'admin' 
                ? 'auth' 
                : registerLevel == 'supermanager'
                    ? req.params[0]
                    : req.project;


        // Ao criar novos usuários
        //      Usuário super - 'managerId' é definido pela query enviada
        //      Usuários normais - 'managerId' é igual a sua própria
        body.managerId = authSuper ? queryManagerId : managerId


        try {

            if (await schema.findOne({ email, managerId: body.managerId}))
                return res.status(400).send({ error: 'User already exists'});
                
            const result = await schema.create(body);

            // Se o usuário que está sendo cadastrado for um manager, o 'managerId' é o seu próprio ID
            if (registerLevel == 'manager') {
                await schema.findOneAndUpdate({ _id: result._id}, {
                    '$set': {
                        managerId: result._id,
                    }
                });
                result.managerId = result._id
            }

            result.password = undefined

            return res.json({ 
                result, 
                token: generateToken({ 
                    id: result._id, 
                    project: body.project, 
                    level: body.level,
                    managerId: result.managerId,
                    stores: result.stores,
                }),
            });

        } catch {
            
            return res.status(400).send({ error: 'Erro User Controller'});
        }
    },





    async index(req, res) {

        const { page = 1 } =  req.query;
        const project = req.project;
        const level     = req.level;
        const managerId = req.managerId;
        const stores = req.stores;

        // O usuários com o mesmo mesmo 'project' e 'managerId' que o seu
        // OBS: 'Usuários 'supermanager' não precisam informar managerId
        // Usuário 'manager', 'superuser' e 'user' podem listar apenas contas de leveis inferiores
        const query = level == 'supermanager' 
            ? { $and: [ { project }]}
            : { $and: [ { managerId, project, level: { $in: permission[level].control}  }]};

        // 'superuser' e 'user' podem listar apenas usuários de suas lojas
        if (level == 'superuser' || level == 'user') {

            // Caso o usuário faça parte de pelo menos 1 loja
            if (stores.length > 0) {
                const or = [];
                // Buscar usuários que façam parte de uma de suas lojas
                stores.map(_id => {
                    console.log(_id)
                    or.push({ stores: _id })
                })

                query.$and.push({$or: or})

            } else {
                return res.status(400).send({ error: 'Erro. 0 stores registers in user'});
            }
        };


        const count = await schema.countDocuments(query);


        let result = await schema.find(query)
        .skip((page - 1) * 5)
        .limit(5)
        .then ((data) => { 
            //console.log (data); 
            return data
        }).catch ((err) => { 
            console.log (err); 
        })

        res.header('X-Total-Count', count['count(*)']);

        return res.json(result)

    },






    async edit(req, res) {
        
        const body = req.body;
        const _id = body._id

        // Ninguém pode alterar esses campos de um usuário
        delete body._id
        delete body.email 
        delete body.project 
        delete body.passwordResetToken
        delete body.passwordResetExpires
        delete body.creatorId
        delete body.managerId  

        // Se o usuário estiver tentando atualizar seu próprio cadastro
        if (req.userId === _id) {
            delete body.level              
            delete body.stores             
        }

        try {
            const update = await schema.findOneAndUpdate({ _id }, {
                '$set': body
            });

            return res.json(update);
        } catch (err) {
            
            return res.status(400).send({ error: 'Erro edit item'});
        }

        

    },




    async delete(req, res) {
       
        const { _id } = req.query;

        try {
            await schema.findByIdAndRemove(_id);
        } catch (err) {
            return res.status(400).send({ error: 'Erro delete item'});
        }

        return res.json();

    },

};