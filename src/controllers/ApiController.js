const easychat = require('./ApiControllerIntents/easychat');

module.exports = async (req, res) => {

    // Verifica se a intenção está cadastrada no arquivo de configuração do projeto
    const intent = (req.project.intents).find(intent => intent == req.intent)

    if (!intent)
        return res.status(400).send({error: 'Route or intent inválid'})    
    
    // Chama a função de acordo com o projeto e a intenção;
    eval(req.project.name)[intent](req, res)

}