const createAdminUser = require('./createAdminUser')
const createGenericUser = require('./createGenericUser')
const createStore   = require('./createStore')

module.exports = async () => {

    const stores = [];
    const users = {
        admin: await createAdminUser()
    }

    const others = ['supermanager', 'manager', 'superuser', 'user', 'client']

    for await (const lev of others) {

        const type = lev == 'supermanager'
            ? 'admin'
            : lev == 'manager'
                ? 'supermanager'
                : 'manager'

        const managerId = (lev == 'supermanager' || lev == 'manager')
            ? 'admin'
            : undefined

        users[lev] = await createGenericUser(users[type], lev, true, managerId)

        if (lev == 'manager') {
            stores.push(await createStore(users.supermanager, users.manager.managerId, true))
        }

    }



    return { users, stores }

}