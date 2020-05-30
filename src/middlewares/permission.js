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

    // Configuração de permissões de acordo com a url acessada e o level do usuário
    const acess = permissionConfig[level]

    // Verifica se o projeto informado é válido
    if (!Boolean(projectConfig.find( a => { return a.name == project})))
        return res.status(400).send({ error: 'PARAM "project". Camp incorret'});


    // Caso a rota seja a de usuários
    if (url === '/user/*') {

        // Todos os usuários podem alterar seus próprios cadastros
        if (method == 'PUT' && userId === req.body._id) {
            return next(); 
        }

        // O método get retorna dados de acordo com parâmetros internos
        if (method == 'GET') {
            return next(); 
        }

        // Bloqueia usuários que estejam tentando editar dados de um alguém do nível superior 
        if (!Boolean(acess.control.find( a => { return a == req.body.level})))
            return res.status(400).send({ error: 'You dont have access to the user level'});

        if (method == 'POST') {
            return next(); 
        }

  
        // Verificar o cadastro que se quer manipular
        const { email } = req.body

        // Se o usuário for um 'super', deverá informar uma QUERY com 'managerId' do usuário que quer manipular
        // Como usuários comuns possuem esse campo setado automaticamente de acordo com o seu próprio, caso seja encontrado
        // um cadastro, significa que o usuário é da sua própria organização
        const register = await schema.findOne({ email, managerId: superUser ? req.query.managerId : managerId})

        if (!register)
            return res.status(400).send({ error: 'register not found'});

 
        return next(); 

    }
            

    // ROTA PARA EDIÇÃO DE LOJAS
    if (url === '/store/*') {
        
        // CASO O USUÁRIO SEJA 'supermanager'
        if (level === 'supermanager'){
            return next()
        }

        if (level == 'manager') {
            // Caso seja um usuário 'manager' querendo carregar suas lojas
            if (method == 'GET')
                return next()
            // Caso seja um usuário 'manager' querendo editar suas lojas
            if (method == 'PUT' && req.query.storeId == managerId)
                return next()
        }

        return res.status(400).send({ error: 'You are not authorized to edit store'});

    }

};