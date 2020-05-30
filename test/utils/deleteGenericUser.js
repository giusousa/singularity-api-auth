const request = require('supertest');
const app = require('../../src/app');
const proj = require('../config/project.json')

const urlBase = '/user'

module.exports = async (user, body, intent, managerId) => {

    const url = user.level == 'admin' ? `${urlBase}/auth` : `${urlBase}/${proj.name}`

    const query = managerId ? { managerId } : { };

    const register = await request(app)
    .delete(url)
    .query(query)
    .set('authorization', user.token)
    .send(body)

    if (intent == true) {
        expect(200)
    } else {
        expect(400)
    }


}