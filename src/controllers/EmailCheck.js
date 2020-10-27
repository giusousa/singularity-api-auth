const schema = require('../mongo/user');
const Mongo = require('./scripts/mongo');

module.exports = async (req, res) => {

    const data = await Mongo.index(res, schema, req.body, 'managerId level');

    if (data.length === 0)
        return res.status(400).send({error: 'User not found'})

    if (data[0].level === 'admin' || data[0].level === 'supermanager')
        return res.status(400).send({error: 'User unavailable for this function'}) 

    console.log(data)


    const managersUser = await data.reduce(async (acc, { managerId }) => {
        const  [{name, managerName}] = await Mongo.index(res, schema, { managerId }, 'name managerName');
        console.log(name)
        console.log(managerName)
        console.log([...acc, {managerId, managerName: managerName || name}])
        return [...acc, {managerId, managerName: managerName || name}]
    }, [])

    res.send(managersUser);

};