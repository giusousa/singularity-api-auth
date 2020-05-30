const schema = require('../mongo/user');
const generateToken = require('../utils/generateToken')

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
                    managerId: result.managerId
                }),
            });

        } catch {
            
            return res.status(400).send({ error: 'Erro User Controller'});
        }
    },

































    async index(req, res) {

        const { page = 1 } =  req.query;
        const project = req.project
        const managerId = req.managerId

        const count = await schema.countDocuments();

        let result = await schema.find({ project, $or:[{managerId: managerId}, {level:"supermanager"}] })
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

        // Ninguém pode alterar esses campos de um usuário
        delete body._id
        delete body.email 
        delete body.project 
        delete body.passwordResetToken
        delete body.passwordResetExpires
        delete body.creatorId
        delete body.managerId  

        // Se o usuário estiver tentando atualizar seu próprio cadastro
        if (req.userId === req.body._id) {

            delete body.level              
            delete body.stores             

        }


        try {

            await schema.findOneAndUpdate({ _id: req.body._id}, {
                '$set': body
            });

        } catch (err) {

            return res.status(400).send({ error: 'Erro edit item'});
        }

        return res.json();

    },










    async delete(req, res) {
       
        const userId = req.body._id

        try {
            schema.deleteOne({ _id: userId});
        } catch (err) {
            return res.status(400).send({ error: 'Erro delete item'});
        }

        return res.json();

    },



};