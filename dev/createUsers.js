const userSchema = require('../src/mongo/user')
const request = require('supertest');
const app = require('../../src/app');
const projectConfig = require('../src/config/project.json')


module.exports = async () => {

    /**
     * 
     * Informações dos usuários que devem ser criados
     * 
     */

    const users = { };

    const usersCreate = [ 
        { level: 'supermanager',    email: 'supermanager',  create: 'admin'},

        { level: 'manager',         email: 'manager1',      create: 'supermanager'},
        { level: 'superuser',       email: 'superuser11',   create: 'manager1'  },
        { level: 'superuser',       email: 'superuser12',   create: 'manager1'},
        { level: 'user',            email: 'user11',        create: 'superuser11'},
        { level: 'user',            email: 'user12',        create: 'superuser12'},
        { level: 'client',          email: 'client11',      create: 'user11'},
        { level: 'client',          email: 'client12',      create: 'user12'},
        
        { level: 'manager',         email: 'manager2',      create: 'supermanager'},
        { level: 'superuser',       email: 'superuser21',   create: 'manager2'  },
        { level: 'superuser',       email: 'superuser22',   create: 'manager2'},
        { level: 'user',            email: 'user21',        create: 'superuser21'},
        { level: 'user',            email: 'user22',        create: 'superuser22'},
        { level: 'client',          email: 'client21',      create: 'user21'},
        { level: 'client',          email: 'client22',      create: 'user22'},
    ]

    // Cria um usuário administrador
    const body = {
        name: 'admin',
        email: `admin@gmail.com`,
        level: 'admin',
        stores: [],
        attributes: {},
        creatorId: "",
        project: "auth",
        managerId: "admin",
        password: "123456",
    };

    const result = await userSchema.create(body);
    users.admin.id      = result.body.result._id;
    users.admin.token   = result.body.token;



    projectConfig.map(proj => {
        if (proj.name != 'utils' && proj.name != 'auth') {   
            for ( const prop in usersCreate) {
                const user = usersCreate[prop];
                createUser(proj.name, user.level, user.email, user.create, users[user.create].id)
            }
        };
    });


    function createUser(project, level, email, create, managerId) {

        const body = {
            name: email,
            email: email + '@gmail.com',
            level: level,
            password: "123456"
        }

        const url = `/user/${project}`
        const query = {managerId};

        const register = await request(app)
        .post(url)
        .query(query)
        .set('authorization', users[create].token)
        .send(body)


        users[create].id        = register.body.result._id;
        users[create].token     = result.body.token;

    }

}