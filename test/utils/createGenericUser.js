const request = require('supertest');
const app = require('../../src/app');
const proj = require('../config/project.json')

module.exports = async (user, levelNewUser, intent , managerId) => {

    const body = {
        password:  '12345678',
        stores: [],
        attributes: {},
    };

    const  random = Math.random().toString(36).substring(0, 15)

    body.level = levelNewUser
    body.name = random
    body.email = `${random}@gmail.com`
    
    const url = body.level == 'admin' ? '/user/auth' : `/user/${proj.name}`
    const query = managerId ? { managerId } : { };

    const register = await request(app)
    .post(url)
    .query(query)
    .set('authorization', user.token)
    .send(body)


        if (intent == true) {
            expect(register.body).toHaveProperty('token')
            register.body.result.token =  `Bearer ${register.body.token}`
            return register.body.result

        } else {
            expect(400)
        }

    
}