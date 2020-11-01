const schema = require('../mongo/user');
const crypto = require('crypto');
const mailer = require('../services/mailer');
const fs = require('fs');
const handlebars = require('handlebars');


module.exports = {

    async create(req, res) {

        const html = fs.readFileSync('./src/utils/mail/auth/forgotPassword.html', {encoding:'utf-8'});
        const htmlCompile = handlebars.compile(html);

        const { managerId } = req.query;
        const { email } = req.body;
        
        try {
           
            // Buscar usuários pelo e-mail
            const user = await schema.findOne({ email, managerId });

            // Caso não tenha sido encontrado um usuário
            if(!user )
                return res.status(400).send({ error: 'User not found'});

            const token = crypto.randomBytes(20).toString('hex');

            const now = new Date();
            now.setHours(now.getHours() + 1);

            await schema.findOneAndUpdate({ _id: user._id}, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now,
                }
            });

            const replacements = { token };
            const template = htmlCompile(replacements);

            await mailer.sendMail({
                to: email,
                from: "atendimento@nerastreamento.com",
                subject: "Recuperação de Senha",
                //text: "Hello world?", // plain text body
                //html: "<b>Hello world?</b>", // html body
                html: template,
            }, (err) => {
                if (err) {
                    return res.status(400).send({ error: 'Cannot send forgot password email'}); 
                } else {
                    return res.send();
                } 
            });

        } catch (err) {
            res.status(400).send({ error: 'Error on forgot password, try again' });
        }
    },
};