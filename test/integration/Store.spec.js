const request = require('supertest');     
const app = require('../../src/app');

const createComplete = require('../utils/createComplete');
const createStore = require('../utils/createStore');
const editStore = require('../utils/editStore');
const deleteStore = require('../utils/deleteStore');

describe('Store', () => {

    it('Cadastrar Store', async () => {    

        const { users, stores } = await createComplete()

            // Verifica todos os usuários criados
            for await (const lev of Object.keys(users)) {

                // Usuário processado no momento
                const user = users[lev];

                // Somente usuários 'supermanager' podem criar lojas
                const intentCreateDelete = (lev == 'supermanager');
                const store = await createStore(user, users.manager.managerId, intentCreateDelete)

                // Somente esses usuários podem alterar uma loja
                const intentEdit = (lev == 'supermanager' || lev == 'manager' || lev == 'superuser')

                const storeId = store ? store._id : stores[0]._id

                await editStore(user, storeId, intentEdit)

                await deleteStore(user, storeId, intentCreateDelete)

            }

    }, 30000)
})