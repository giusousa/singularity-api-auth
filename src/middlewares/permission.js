const userSchema = require('../mongo/user');
const projectConfig = require('../config/project.json')
const permissionConfig = require('../config/permission.json')

module.exports = async (req, res, next) => {

    const url       = req.route.path;
    const { userId, level, project, stores, managerId, method, body } = req;
    // O usuário 'admin' é o único que pode alterar informações de todos os projetos

    const superUser = (level == 'admin' || level == 'supermanager')

    //j
    // Configuração de permissões de acordo com a url acessada e o level do usuário
    const acess = permissionConfig[level]

    // Verifica se o projeto informado é válido
    if (!Boolean(projectConfig.find( a => { return a.name == project})))
        return res.status(400).send({ error: 'PARAM "project". Camp incorret'});


    // Caso a rota seja a de usuários
    if (url === '/user/*') {


        if (method == 'POST') {
            // Bloqueia usuários que estejam tentando Criar usuários de um alguém do nível superior 
            if (!Boolean(acess.control.find( a => { return a == req.body.level})))
                return res.status(400).send({ error: 'You dont have access to the user level'});

            // Se o criador for um usuário Super
            // devera informar qual será o MANAGERID daquele cadastro              
            if (superUser && !body.managerId && (body.level !== 'admin' || body.level !== 'supermanager'))
                return res.status(400).send({ error: 'need to inform the query: ManagerId'});
            if (!superUser)
                req.body.managerId = managerId
            return next(); 
        }
        
        // O método get retorna dados de acordo com parâmetros internos
        if (method == 'GET') {
            return next(); 
        }


        // ID que será manipulado
        const _id = method == 'DELETE' ? req.query._id : req.body._id;

        // Todos os usuários podem alterar seus próprios cadastros
        if (method == 'PUT' && userId === _id) {
            return next(); 
        }

        if (method == 'PUT' || method == 'DELETE') {

            // Verifica se existe um cadastro com o ID informado
            try {   
                const register = await userSchema.findOne({  _id })
 
                // Bloqueia usuários que estejam tentando editar dados de um alguém do nível superior 
                if (!Boolean(acess.control.find( a => { return a == register.level})))
                    return res.status(400).send({ error: 'You dont have access to the user level'});
 
                // Caso a pessoa não seja um 'superUser', poderá alterar apenas users da sua organização
                if (!superUser && (managerId != register.managerId))
                    return res.status(400).send({ error: 'You dont have access to the user group'});

                // Um usuário só pode editar para um 'level' que ele seja permitido  
                if (body.level && !Boolean(acess.control.find( a => { return a == body.level})))
                    return res.status(400).send({ error: 'You dont have access to manipulate level'});

            } catch (err) {
                return res.status(400).send({ error: 'User not found'});
            }

            return next(); 
        }
    }
            

    // ROTA PARA EDIÇÃO DE LOJAS
    if (url === '/store/*') {

        // Um usuário manager só pode deletar lojas que pertençam a ele mesmo
        if (level == 'manager' && method == 'POST')
            req.body.managerId = userId;
        if (level == 'manager' && (method == 'PUT' || method == 'GET' || method == 'DELETE'))
            req.query.managerId = userId
        
        // Caso seja um usuário querendo carregar uma loja
        if (method == 'GET') {
            // O usuário deverá ter lojas cadastradas para poder listar
            if (level !== 'manager' && stores.length > 0) {
                req.query.$or  = [];
                stores.map(_id =>  req.query.$or.push({_id}) )
            };
            return next()
        }
            
        // Caso seja um 'supermanager' querendo criar uma loja
        if (level === 'supermanager' && method == 'POST' && !req.body.managerId)
            return res.status(400).send({error: 'QUERY "managerId". Camp incorret'});

        // CASO O USUÁRIO SEJA 'supermanager' ou manager
        if (level === 'supermanager' || level == 'manager')
            return next()
        
        return res.status(400).send({ error: 'You are not authorized to edit store'});

    }

};