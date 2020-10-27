const schema = require('../mongo/user');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken')


module.exports = {

    async create(req, res) {

        const { email, password, managerId = 'admin' } = req.body
        const emailParse = String(email).toLowerCase().trim()
        
        // Verifica se o usuário existe no banco de dados
        const result = await schema.findOne({ email: emailParse, managerId }).select('name email password level project stores managerId attributes');

        // Caso o usuário não exista, enviar aviso de erro
        if (!result) 
            return res.status(400).send({ error: 'User not found' });
        
        // Caso a senha não esteja correta, informar erro
        if (!await bcrypt.compare(password, result.password)) {
            return res.status(400).send({ error: 'Invalid password' });
        }

        // deleta esse campo para que não seja retornado
        result.password = undefined;

        const superUser = (result.level == 'admin' || result.level == 'supermanager')

        const token = generateToken({ 
            id: result._id, 
            project: result.project, 
            level: result.level, 
            managerId: result.managerId,
            stores: result.stores,
        });

        // Coolies de contas 'admin' e 'superuser' valem apenas por 6 horas por motivos de segurança
        // Cookie de outros leveis é válido por 60 dias
        res.cookie('auth_token', token, { maxAge: superUser ? 21600 : 5184000000, httpOnly: true });
        res.json({ 
            result, 
            token
        });
        
    },



    async index(req, res) {

        const user = await schema.findOne({ _id: req.userId });
        res.json(user);

    },


    async delete(req, res) {
        
        res.clearCookie('auth_token')
        res.status(200).send();

    },


};