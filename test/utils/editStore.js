const request = require('supertest');
const app = require('../../src/app');
const proj = require('../config/project.json')

module.exports = async (user, storeId, intent) => {

    const body = {
        name: 'store teste EDITADA'
    };

    const url = `/store/${proj.name}`

    const register = await request(app)
    .put(url)
    .query({ storeId })
    .set('authorization', user.token)
    .send(body)

        if (intent == true) {
            expect(200)
        } else {
            expect(400)
        }


}