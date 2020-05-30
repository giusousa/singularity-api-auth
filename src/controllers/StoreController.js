const schema = require('../mongo/store');

module.exports = {

    async create(req, res) {

        const infos = req.body;

        try {
            infos.project = req.project;

            const result = await schema.create(infos);

            return res.json(result);

        } catch (err) {

            return res.status(400).send({ error: 'Erro create item'});
        }

    },

    // Busca as lojas disponíveis
    async index(req, res) {

        const { page = 1 } =  req.query;

        // Informações para realizar a busca
        const query = { 
            project: req.project
        }

        // Se o usuário for um 'manager'
        if (req.level == 'manager')
            query.managerId = req.managerId

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
        
        const infos = req.body
        const { storeId } =  req.query;

        if (infos.project)
            delete infos.project;
        
        if (infos.managerId)
            delete infos.managerId;

        try {

            await schema.findOneAndUpdate({ _id: storeId}, {
                '$set': infos
            });

        } catch (err) {
            //console.log(err)
            return res.status(400).send({ error: 'Erro edit item'});
        }


        return res.json();


    },
    
    async delete(req, res) {
        

        const { storeId } =  req.query;

        try {
            schema.deleteOne({ _id: storeId});
        } catch (err) {
            return res.status(400).send({ error: 'Erro delete item'});
        }

        return res.json();

    },

};