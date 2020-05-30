const request = require('supertest');     
const app = require('../../src/app');

const proj  = require('../config/project.json')
const permissionConfig = require('../../src/config/permission.json')

const createComplete = require('../utils/createComplete')
const createGenericUser = require('../utils/createGenericUser')
const editGenericUser = require('../utils/editGenericUser')
const deleteGenericUser = require('../utils/deleteGenericUser')


describe('User', () => {

    it('Cadastrar User', async () => {    

        // Cria um grupo de usuários
        const { users, stores } = await createComplete()
        const levelArray = ["admin", "supermanager", "manager", "superuser", "user", "client"]

        // Verifica todos os usuários criados
        for await (const lev of Object.keys(users)) {

            // Usuário processado no momento
            const user = users[lev];

            // Repete a função para todos os leveis
            for await (const newLevel of levelArray) {

                // Calcula se a função deve esperar um resultado positivo ou negativo
                const intent = Boolean(permissionConfig[lev].control.find( a => { return a == newLevel}))

                const superUser = (lev == 'admin' || lev == 'supermanager')
                const createSuperUser =  (newLevel == 'admin' || newLevel == 'supermanager')

                // ManagerId de acordo como nível do user
                const managerId = (createSuperUser || newLevel == 'manager') 
                ? 'admin'
                : superUser
                    ? users.manager.managerId
                    : undefined;

                // Vai tentar criar um novo usuário
                const newUser = await createGenericUser(user, newLevel, intent, managerId)

                const infosEdit = {
                    name: 'newName',
                    _id: newUser ? newUser._id : users[newLevel]._id
                };

                // Vai tentar editar o cadastros
                await editGenericUser(user, infosEdit, intent, managerId)

                await deleteGenericUser(user, infosEdit, intent, managerId)

            }
        }

        // TESTE: Não é possível manipular usuários de outra organização.
        // TESTE: Não é possível acessar sem autenticação.




            // Remover os dados criados
            // const schema = require('../../src/mongo/client');
            //await schema.deleteMany({ _id: response.body._id })

    }, 30000);


  //  it('Listar Client', async () => {
 //       const response = await request(app)
 //       .get('/client')
    //    .set('authorization', 'admin')

    //    expect(response.status).toBe(200)
    
  //  });


});

