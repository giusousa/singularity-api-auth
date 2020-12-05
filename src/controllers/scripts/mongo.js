const formatMongo = require('./formatMongo');
const { setRedis, getRedis } = require('../../services/redis');
const { Socket }= require('../../services/socket')

module.exports = {
    async create (res, schema, body) {
        try {
            const data = await schema.create(body);
            return data._doc;
        } catch (err) {
            return res.status(400).send({ error: 'create database fail: ' + err})
        };
    },
    
    async index (res, schema, query, select) {
        const { page, skip = 0 } =  query;
        delete query.page;
        delete query.skip;

        try {
            if ( page ) {
                const count = await schema.countDocuments(query);
                const data = await schema.find(query)
                .skip((page - 1) * 10 + skip)
                .limit(10)
                .select(select)
                .sort({_id:-1}) 
                
                res.header('X-Total-Count', count);
                return data;
            } else {
                const data = await schema.find(query).select(select)
                return data;
            };



        } catch(err) {
            return res.status(400).send({ error: 'index database fail: ' + err})
        };
    },

    async edit (res, resAut, schema, body, query = {}, redisId) {
 
        query._id = body._id;
        const {body:bodyFormat, query:queryFormat} = formatMongo(body, query);

        const {$push, ...rest} = bodyFormat

        const newBody = {};
        newBody.$set = rest

        if ($push) 
            newBody.$push = $push

            
        try {
            const data = await schema.findOneAndUpdate(queryFormat, newBody);

            if (!data) {
                res.status(400).send({error: 'Document _id not found'});
                return 
            }
                
            const newData = await schema.findById(body._id).lean();
            
            if (redisId)
                setRedis(redisId, newData);
                
            if (resAut)
                res.send(newData);

            return newData
        } catch (err) {
            return res.status(400).send({ error: 'Edit database fail: ' + err});
        };
    },
    
    async delete ( res, resAut, schema, query, redisId ) {
        try {
            // O sistema realiza uma busca, e se encontrar um arquivo com os parâmetros informados irá deleta-lo
            const data = await schema.findOneAndRemove(query);
            // Caso nenhum documento seja encontrado, será retornado um erro
            if (!data) {
                res.status(400).send({ error: 'Document not found'});
                return 
            }
                
            // Se um redisId for fornecido, a key será deletada de redis
            if(redisId)
                setRedis(redisId, '', 1);

            const response = {_id: data._id, delete: true}
            // Se um objeto res for informado, uma resposta padrão será retornada
            if (resAut)
                res.status(200).send(response);
                
            // Retorna os dados
            return response
        } catch (err) {
            res.status(400).send({ error: 'Delete database fail: ' + err});
            return 
        }
    }
};