const request = require('supertest');
const app = require('../../src/app');
const proj = require('../config/project.json')

module.exports = async (user, managerId, intent) => {

    const body = {
        name: 'store teste',
        managerId: managerId,
    };

    const url = `/store/${proj.name}`

    const register = await request(app)
    .post(url)
    .set('authorization', user.token)
    .send(body)

        if (intent == true) {
            expect(register.body).toHaveProperty('_id')
        } else {
            expect(400)
        }

    return register
    
}