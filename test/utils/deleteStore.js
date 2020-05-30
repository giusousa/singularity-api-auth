const request = require('supertest');
const app = require('../../src/app');
const proj = require('../config/project.json')

const urlBase = '/store'

module.exports = async (user, storeId, intent) => {

    const url = `${urlBase}/${proj.name}`

    const register = await request(app)
    .delete(url)
    .query({ storeId })
    .set('authorization', user.token)

    if (intent == true) {
        expect(200)
    } else {
        expect(400)
    }

}