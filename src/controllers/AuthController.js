const schema = require('../mongo/user');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const {getRedis}    = require('../services/redis');
const error         = require('./scripts/error')

module.exports = {

    async create(req, res) {

        const { email, password, managerId, projectId } = req.body
        req.body.email = String(email).toLowerCase().trim()
        delete req.body.password;
        // Verifica se o usuário existe no banco de dados
        const result = await schema.find(req.body).select('name creatorId managerId projectId email level password').lean();

        // Caso o usuário não exista, enviar aviso de erro
        if (result.length === 0) 
            return error(req, res, 'User not found');
 
        // Caso tenham sido encontrados mais que 1 resultado
        if (result.length > 1)
            return error(req, res, 'Params projectId or managerId not found');
            
        const userData = result[0];
        
        const superUser= userData.level === 'admin' || userData.level === 'supermanager'

        if (!projectId && !superUser)
            return error(req, res, 'Params Body projectId required');
            
        if (!superUser) {
            // ACTION: Busca projeto no redis
            const project = await getRedis(projectId, 'project');
            // ERRO: Projeto não encontrado
            if (!project)
                return error(req, res, 'Project not found: ' + projectId);

            if (!managerId && project.managerWorkspace)
                return error(req, res, 'Params managerId required');

        }

        // Caso a senha não esteja correta, informar erro
        if (!await bcrypt.compare(password, userData.password)) {
            return res.status(400).send({ error: 'Invalid password' });
        }

        // deleta esse campo para que não seja retornado
        userData.password = undefined;

        // Em MS - 6 Horas para superUsers e 60 dias para demais
        const maxAge = superUser ? 21600000 : 5184000000;
        const token = generateToken({ maxAge, ...userData });

        // Coolies de contas 'admin' e 'superuser' valem apenas por 6 horas por motivos de segurança
        // Cookie de outros leveis é válido por 60 dias
        res.cookie('auth_token', token, { maxAge, httpOnly: true });
        res.json({ result, token });
        
    },

    async index(req, res) {

        const user = await schema.findOne({ _id: req.userData._id }).lean();
        if(!user)
            return res.clearCookie('auth_token').status(400).send({error: 'User not found'});
        res.json(user);

    },


    async delete(req, res) {
        
        res.clearCookie('auth_token')
        res.status(200).send();

    },


};