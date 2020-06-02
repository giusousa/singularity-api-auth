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

        const level     = req.level;
        const userId    = req.userId;

        const { page = 1 } =  req.query;
        const stores = req.query.stores ? JSON.parse(req.query.stores) : [];

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

        const result = await schema.find(query)
        .skip((page - 1) * 5)
        .limit(5)
        .then ((data) => { 
            //console.log (data); 
            return data
        }).catch ((err) => { 
            console.log (err); 
        })

        res.header('X-Total-Count', count['count(*)']);

        return res.json(result)


    },

    async edit(req, res) {
        
        const infos     = req.body;
        const { level, userId }     = req;
        const { storeId }   =  req.query;

        const query         = { _id: storeId };
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

            await schema.findOneAndUpdate(query, {
                '$set': infos
            });

        } catch (err) {
            //console.log(err)
            return res.status(400).send({ error: 'Erro edit item'});
        }


        return res.json();


    },
    
    async delete(req, res) {
        
        const { level, userId }     = req;
        const { storeId }   =  req.query;

        const query         = { _id: storeId };
        // Um usuário manager só pode alterar lojas que pertençam a ele mesmo
        if (level == 'manager')
            query.managerId = userId

        try {
            await schema.findByIdAndRemove(storeId);
        } catch (err) {
            return res.status(400).send({ error: 'Erro delete item'});
        }

        return res.json();

    },

};