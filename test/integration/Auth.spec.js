const request = require('supertest');      
const app = require('../../src/app');
const proj = require('../config/project.json')
const createComplete = require('../utils/createComplete')

const urlBase = '/auth' 

describe('Auth', () => {

  it('Create_index_delete', async () => {    

    // Cria um grupo de usuários
    const { users, stores } = await createComplete()

    // Verifica todos os usuários criados
    for await (const lev of Object.keys(users)) {

      // Usuário a ser processado
      const user = users[lev]

      // Url da requisição
      const url = user.level == 'admin' ? `${urlBase}/auth` : `${urlBase}/${proj.name}`
      const query = { managerId: user.managerId }

      const { email } = user;
      const { password } = proj;

      // Realiza a autenticação no sistema
      const create = await request(app)
      .post(url)
      .query(query)
      .send({email, password})

      expect(create.body).toHaveProperty('token')

      const token = create.body.token

      // Realiza a consulta de sua autenticação 
      const index = await request(app)
      .get(url)
      .set('Cookie', [`auth_token=${token}`])
      
      expect(index.body).toHaveProperty('_id')

      // Deleta os cookies da sess]ao
      const del = await request(app)
      .delete(url)
      .set('Cookie', [`auth_token=${token}`])

      expect(200)

    }

  }, 30000 )

});

