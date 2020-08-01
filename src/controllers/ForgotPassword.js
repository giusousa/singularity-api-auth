const schema = require('../mongo/user');
const crypto = require('crypto');
const mailer = require('../services/mailer');

module.exports = {

    async create(req, res) {

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


            await mailer.sendMail({
                to: email,
                from: "atendimento@nerastreamento.com",
                //subject: "Hello",
                //text: "Hello world?", // plain text body
                // html: "<b>Hello world?</b>", // html body
                html: 'auth/forgotPassword',
                context: { token },
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