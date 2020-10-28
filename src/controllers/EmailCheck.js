const schema = require('../mongo/user');
const Mongo = require('./scripts/mongo');

module.exports = async (req, res) => {

    const data = await Mongo.index(res, schema, req.body, 'managerId level');

    if (data.length === 0)
        return res.status(400).send({error: 'User not found'})

    if (data[0].level === 'admin' || data[0].level === 'supermanager')
        return res.status(400).send({error: 'User unavailable for this function'}) 

    const managersUser = []
    await Promise.all(data.map(async ({ managerId }) => {
        const  [{name, managerName}] = await Mongo.index(res, schema, { managerId }, 'name managerName');
        managersUser.push({managerId, managerName: managerName || name})
    }));

    res.send(managersUser);

};