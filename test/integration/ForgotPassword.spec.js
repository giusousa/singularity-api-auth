const request = require('supertest');      
const app = require('../../src/app');
const proj = require('../config/project.json');
const createComplete = require('../utils/createComplete');

const urlBase = '/forgot_password' 

describe('ForgotPassword', () => {

    it('Create', async () => {    

        // Cria um grupo de usuários
        const { users, stores } = await createComplete()

        // Verifica todos os usuários criados
        for await (const lev of Object.keys(users)) {

            // Usuário a ser processado
            const user = users[lev]
            const { email, password, level, managerId } = user

            const url = level == 'admin' ? `${urlBase}/auth` : `${urlBase}/${proj.name}`
            const query = { managerId }
            // Envia a solicitação de reset de senha ao servidor
            const create = await request(app)
            .post(url)
            .query(query)
            .send({email})
            .expect(200)

            // Muitas requisições simultâneas podem travar se o servidor de emails for gratuito
            await new Promise(resolve => setTimeout(resolve, 1000));

        }

    }, 30000);


});

