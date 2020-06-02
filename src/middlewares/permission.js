const userSchema = require('../mongo/user');
const projectConfig = require('../config/project.json')
const permissionConfig = require('../config/permission.json')

module.exports = async (req, res, next) => {

    const url       = req.route.path;
    const method    = req.method;

    // O usuário 'admin' é o único que pode alterar informações de todos os projetos
    const userId    = req.userId;
    const level     = req.level;
    const project   = req.project;
    const managerId = req.managerId;
    
    const superUser = (level == 'admin' || level == 'supermanager')

    //j
    // Configuração de permissões de acordo com a url acessada e o level do usuário
    const acess = permissionConfig[level]

    // Verifica se o projeto informado é válido
    if (!Boolean(projectConfig.find( a => { return a.name == project})))
        return res.status(400).send({ error: 'PARAM "project". Camp incorret'});


    // Caso a rota seja a de usuários
    if (url === '/user/*') {

        // Verificar o cadastro que se quer manipular
        const { _id } = req.body

        // Todos os usuários podem alterar seus próprios cadastros
        if (method == 'PUT' && userId === _id) {
            return next(); 
        }

        // O método get retorna dados de acordo com parâmetros internos
        if (method == 'GET') {
            return next(); 
        }


        if (method == 'POST') {
            // Bloqueia usuários que estejam tentando Criar usuários de um alguém do nível superior 
            if (!Boolean(acess.control.find( a => { return a == req.body.level})))
                return res.status(400).send({ error: 'You dont have access to the user level'});

            return next(); 
        }

        if (method == 'PUT' || method == 'DELETE') {

            // Verifica se existe um cadastro com o ID informado
            try {   
                const register = await userSchema.findOne({  _id })
                console.log(register)

                // Bloqueia usuários que estejam tentando editar dados de um alguém do nível superior 
                if (!Boolean(acess.control.find( a => { return a == register.level})))
                    return res.status(400).send({ error: 'You dont have access to the user level'});
 
                    // Caso a pessoa não seja um 'superUser', poderá alterar apenas users da sua organização
                if (!superUser && (managerId != register.managerId))
                    return res.status(400).send({ error: 'You dont have access to the user group'});

            } catch (err) {
                return res.status(400).send({ error: 'User not found'});
            }

            return next(); 
        }
    }
            

    // ROTA PARA EDIÇÃO DE LOJAS
    if (url === '/store/*') {
        
        // Caso seja um usuário querendo carregar uma loja
        if (method == 'GET') {
            if (level != 'manager' && !req.query.stores)
                return res.status(400).send({error: 'QUERY "stores". Camp incorret'});

            return next()
        }
           

        // Caso seja um 'supermanager' querendo criar uma loja
        if (level === 'supermanager' && method == 'POST' && !req.query.managerId)
            return res.status(400).send({error: 'QUERY "managerId". Camp incorret'});

        // CASO O USUÁRIO SEJA 'supermanager' ou manager
        if (level === 'supermanager' || level == 'manager')
            return next()
        

        return res.status(400).send({ error: 'You are not authorized to edit store'});

    }

};