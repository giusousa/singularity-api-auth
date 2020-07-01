const schema = require('../mongo/store');

module.exports = {

    async create(req, res) {

        const infos     = req.body;
        const level     = req.level;
        const userId    = req.userId;

        try {
            infos.project = req.project;

            infos.managerId = level == 'manager' 
                ? userId 
                : level == 'supermanager' 
                    ? req.query.managerId
                    : res.status(400).send({error: 'Erro create item'});

            const result = await schema.create(infos);

            return res.json(result);

        } catch (err) {

            return res.status(400).send({ error: 'Erro create item'});
        }

    },

    // Busca as lojas disponíveis
    async index(req, res) {

        const { page } =  req.query;
        const { level, userId } = req;

        // Usuário 'manager' buscam todas as lojas com o mesmo "managerId"
        // Usuários 'superuser' buscam as lojas que eles estão cadastrados.
        const stores = level == 'manager' ? [] : req.stores;

        // Se o usuário for um 'manager', buscar as lojas com o Id dele
        const query = { $and: []};
        if (level == 'manager')
            query.$and.push({ managerId: userId});

        // Buscar lojas pelo ID
        if (stores.length > 0) {
            const or = [];
            stores.map(_id => {
                or.push({_id})
                
            })
            query.$and.push({$or: or})
        };

        const count = await schema.countDocuments(query);


        try {
            if ( page ) {
                const result = await schema.find(query)
                .skip((page - 1) * 5)
                .limit(10)
                res.header('X-Total-Count', count['count(*)']);
                return res.json(result);
    
            } else {
                const result = await schema.find(query)
                return res.json(result);
            };
        } catch(err) {
            //console.log (err); 
        }

    },

    async edit(req, res) {
        
        const infos     = req.body;
        const _id       = infos._id
        const { level, userId }    = req;

        const query         = { _id };
        // Um usuário manager só pode alterar lojas que pertençam a ele mesmo
        if (level == 'manager')
            query.managerId = userId

        // Não é possível alterar o projeto da loja
        if (infos.project)
            delete infos.project;

        // Não é possível alterar o managerId da loja
        if (infos.managerId)
            delete infos.managerId;

        try {

            const update = await schema.findOneAndUpdate(query, {
                '$set': infos
            });

            return res.json(update);

        } catch (err) {
            //console.log(err)
            return res.status(400).send({ error: 'Erro edit item'});
        }


    },
    
    async delete(req, res) {
        
        const { level, userId }     = req;
        const { _id }   =  req.query;

        const query         = { _id };
        // Um usuário manager só pode alterar lojas que pertençam a ele mesmo
        if (level == 'manager')
            query.managerId = userId

        try {
            await schema.findByIdAndRemove(_id);
        } catch (err) {
            return res.status(400).send({ error: 'Erro delete item'});
        }

        return res.json();

    },

};