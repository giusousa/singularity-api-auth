const schema = require('../mongo/user');

module.exports = {

    async create(req, res) {

        const { managerId } = req.query;
        const { email, token, password } =  req.body;

        try {
            
            const user = await schema.findOne({ email, managerId })
                .select('+passwordResetToken passwordResetExpires');

            if(!user)
                return res.status(400).send({ error: 'User not found'});

            if(token !== user.passwordResetToken)
                return res.status(400).send({ error: 'Token invalid'})

            const now = new Date();

            if (now > user.passwordResetExpires)
                return res.status(400).send({ error: 'Token expired, generate a new one' });

            user.password = password;

            await user.save();

            res.send()

        } catch (err) {

            res.status(400).send({ error: 'Cannot reset password, try again'});

        };

    },

};