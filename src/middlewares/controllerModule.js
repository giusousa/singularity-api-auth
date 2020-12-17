const mongoIndex    = require('../mongo/index');
const api           = require('../services/api');
const generateToken = require('../utils/generateToken')

const{setRedis, getRedis}=require('../services/redis');

const supermanagerApi = (supermanagerId) => {

    const login = async () => {
        try {
            const user  = await mongoIndex.user.findById(supermanagerId).select('name creatorId managerId projectId email level').lean()
            const token = generateToken({ maxAge: 21600000, ...user });
            setRedis('token/'+supermanagerId, token, 18000);
            return token;
        } catch (err) {
            console.log(err.reponse?err.response.data : err)
        };
    }

    api.interceptors.request.use(
        async config => {
            let token = await getRedis('token/'+supermanagerId)
            if (!token) 
                token = await login()
    
            config.headers.authorization = 'Bearer ' + token
            return config
        },
        error => {
            return Promise.reject(error)
        }
    );

    return api
};

const error     = (req, res, msg, err) => {
    const msgFormat = (() => {
        if (err.response && err.response.data) 
            return msg + ' ' + err.response.data.error + ' ' + err.response.data.message
        return msg + ' ' + String(err)
    })();
    res.status(400).send({error: msgFormat});
};

module.exports.mongoIndex       = mongoIndex
module.exports.supermanagerApi  = supermanagerApi
module.exports.error            = error
module.exports.getRedis         = getRedis
module.exports.env              = process.env.NODE_ENV
