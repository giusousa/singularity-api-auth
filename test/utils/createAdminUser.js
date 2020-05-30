const app = require('../../src/app');
const proj = require('../config/project.json')
const request = require('supertest');

const userSchema = require('../../src/mongo/user')

module.exports = async () => {

    const { password } = proj;
    const  randomEmail = Math.random().toString(36).substring(0, 15)

    const body = {
        name: 'user admin init',
        email: `${randomEmail}@gmail.com`,
        level: 'admin',
        stores: [],
        attributes: {},
        creatorId: "",
        project: "auth",
        managerId: "admin",
        password: password,
    };

    const { email } = body;

    // Salva 'admin' no banco de dados
    const result = await userSchema.create(body);

    // Tenta fazer a autenticação com o perfil criado
    const auth = await request(app)
    .post('/auth/auth')
    .query({ managerId: 'admin' })
    .send({ email, password })
    
    // Salva as informações em um arquivo global para uso posterior
    body._id   = result._id
    body.token = `Bearer ${auth.body.token}`

    return body

};
