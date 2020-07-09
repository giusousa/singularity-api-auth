const easychat = require('./ApiControllerIntents/easychat');

module.exports = {
    async router (req, res) {
        const [ projectName, intent ] = req.params[0].split('/');
        const functionEval  = eval(projectName)[intent];  

        if(!functionEval) 
            return res.status(400).send({error: 'URL inválid'});
    }
};
