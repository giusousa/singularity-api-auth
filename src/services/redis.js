const redis = require('redis');
const mongoIndex = require('../mongo/index');

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

const client = redis.createClient(REDISPORT, REDISHOST);

const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);

const expireDefault = 604800

client.on("error", function (err) {
    console.log("Error "+ err);
});

/** getRedis
 * 
 * @param {String} key (_id do objeto/key no redis ) que se está querendo baixar
 * @param {String} schemaName nome do schema MONGO deste objeto. Caso o ID não seja achado, será buscado no mongoose.
 * @param {String} path Cao a key tenha uma pre-key padronizada. será add ao inicio da key e separada por um '/'
 * 
 * A função buscará as informações no redis através da 'key' informada
 * Caso o redis não encontre um valor com a 'key' informada, e o usuário tiver informado um 'schemaName' válido
 * o sistema irá buscar por aquela informação no banco de dados, e se achar, salvará a informação no redis por 
 * 7 dias.
 * 
 */

async function getRedis(key, schemaName) {
    if(!key)
        return console.log('Redis key undefinied')

    const redisKey =  String(key);
    const res = await getAsync(redisKey);

    if (res) {
        const isObj = res.slice(0,1) === '{' || res.slice(0,1) === '"' 
        return isObj ? JSON.parse(res) : res
    }

    if (schemaName) {

        const query = {};
        let schema = null;
        
        if (schemaName === 'project' || schemaName === 'route'|| schemaName === 'user') {
            schema = mongoIndex[schemaName];

            if (!schema)
                return console.log('mongoIndex in ./src/mongo/index.js not found schema: ' + schemaName);
    
            if (schemaName === 'route') {

                const [projectId, url] = key.split('/')
                if (projectId === 'undefined' || url === 'undefined')
                    return console.log('Key invalid format: ' + key);

                query.projectId = projectId;
                query.url = url;
                
            } else {
                if (key.length !== 24)
                    return console.log('Document _id invalid in mongoose schema: ' + schemaName);
                query._id = key
            };
            
        } else {
            const [projectId, url, _id] = key.split('/')
            if (projectId === 'undefined' || url === 'undefined'|| _id === 'undefined')
                return console.log('Key format invalid: ' + key);
            schema = schemaName;
            query._id = _id
        }
 
        try {
            
            const mongoData = await schema.findOne(query).lean();
            if (!mongoData) return
                
            // ficará armazenado por 1 dias no redis
            setRedis(redisKey, mongoData)
            return mongoData
        } catch (err) {
            console.log(err)
        }
    }
};

/** setRedis
 * 
 * @param {String} id 'key' da informação no Redis
 * @param {*} data informação que será salva no redis com a chave informada
 * @param {Number} expire Tempo em segundos que a informação permanecerá no redis. Caso não informado, será setado 7 dias
 */

function setRedis (id, data, expire = expireDefault) {
    client.set(String(id), JSON.stringify(data));
    client.expire(String(id), expire);
}

exports.redis    = client;
exports.setRedis = setRedis;
exports.getRedis = getRedis;