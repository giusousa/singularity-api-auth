const schemaUser = require('../../mongo/user');
const schemaStore = require('../../mongo/store');

module.exports =  {

    /**
     * A função init busca dados de um usuário e de uma loja
     */
    async init (req, res) {

        const {telephoneUser, telephoneStore} = req.query;

        if (!telephoneUser || !telephoneStore)
            return res.status(400).send({error: 'telephoneStore or telephoneUser inválid'});
        
        const user  = await schemaUser.findOne({ telephone1: telephoneUser, project: 'easychat' });
        const store = await schemaStore.findOne({ telephone1: telephoneStore, project: 'easychat' });

        if (!user || !store)
            return res.status(400).send({error: "user or store not found"})

        return res.status(200).send({user, store});

    },

    /**
     * Verifica se existe um loja ou usuário com o número cadastradado
     */
    async telephoneConsult (req, res) {

        const {telephone, type, managerId} = req.query;

        // Parâmetros obrigatórios
        if (!telephone || !type || (type == 'user' && !managerId))
            res.status(400).send({error: 'QUERY: telephone or type or managerId inválid'});
        // O número precisa ter 12 ou 13 caracters
        if (telephone.length != 12 && telephone.length != 13)
            res.status(400).send({error: 'QUERY: telephone required 12 or 13 caracteres. ex: 5585988558855'});

        // Query de busca
        const query = { telephone1: telephone, project: 'easychat' };

        // Caso esteja buscando um user
        if (type == 'user') 
            query.managerId = managerId 
        
        // Busca no banco de dados
        const consult = type == 'store'
            ? await schemaStore.findOne(query)
            : type == 'user' 
                ?   await schemaUser.findOne(query)
                :   res.status(400).send({error: 'QUERY: type inválid'});

        // Caso haja uma correspondencia, retornar um erro.
        if (consult)
            res.status(400).send({error: 'Number registered'})

        res.status(200).send('Number available')
    }

}