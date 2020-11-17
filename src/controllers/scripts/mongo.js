module.exports = {
    async create (res, schema, body) {
        try {
            const data = await schema.create(body);
            return data;
        } catch (err) {
            return res.status(400).send({ error: 'create database fail'})
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
            return res.status(400).send({ error: 'index database fail'})
        };
    },

    async edit (res, schema, body, query = {}) {
        const { _id } = body;
        query._id = _id;
        try {
            const data = await schema.findOneAndUpdate(query, {
                '$set': body
            });
            const newData = await schema.findById(_id)
            return newData;
        } catch (err) {
            return res.status(400).send({ error: 'Edit database fail'});
        };
    },
    
    async delete ( res, schema, query ) {
        try {
            const data = await schema.findOneAndRemove(query)
            if (!data)
                return res.status(400).send({ error: 'User not found'});
            return res.status(200).send({_id: data._id, managerId: data.managerId});
        } catch (err) {
            return res.status(400).send({ error: 'Delete database fail'});
        }
    }
};