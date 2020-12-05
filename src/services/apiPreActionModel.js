const axios = require('axios');
const {redis, getRedis} = require('./redis');
const api = require('./api');

async function login() {

    const { AUTHAPIEMAIL, AUTHAPIPASSWORD } = process.env;
    const body = { email: AUTHAPIEMAIL, password: AUTHAPIPASSWORD };
    const res = await api.post('auth/auth', body);
    const { token, result } = res.data;

    redis.set('token', token);
    // Um token de user 'supermanager' expira após 6 horas, porém está config para expirar em 5 horas
    redis.expire('token', 18000);
    redis.set('tokendata', JSON.stringify(result));
    redis.expire('tokendata', 18000);

    return token;
};

const apiInstance = axios.create({
    //baseURL: 'http://localhost:3333/api/easychat',
    baseURL: 'https://singularity-api-auth-pprmlyigqq-uc.a.run.app',
})

apiInstance.interceptors.request.use(
    async config => {
        let token = await getRedis('token')
        if (!token) 
            token = await login()

        config.headers.authorization = 'Bearer ' + token
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

module.exports = apiInstance;