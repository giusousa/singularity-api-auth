const {mongoIndex, supermanagerApi, error} = require('./controllerModule');

module.exports = async (req, res, next) => {

    const api       = await supermanagerApi(req.projectData.supermanagerId);

    let responseData = {}

    const preDatabase = req.routeData.preDatabase
    if (!preDatabase || !preDatabase[req.method.toLowerCase()])
        return error('preDatabase function invalid')

    try {
        await eval(preDatabase[req.method.toLowerCase()])()
        
    } catch (err) {
        return error(req, res, 'Function preDatabase error:', err)
    }

    return res.send(responseData)
};