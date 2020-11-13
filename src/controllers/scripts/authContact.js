const schemaContact = require('../../mongo/contact');

module.exports = async (req, res, contactId) => {

    const { userId, level, project, stores, body, query, method } = req;

    try {
        
        const contact = await schemaContact.findById(contactId)
            .select('group project storeId managerId')
            .lean()

        if (!contact) {
            res.status(400).send({error: 'ContactId not found'})
            return
        }
                
        const { group, storeId, managerId } = contact
    
        // O usuário está no grupo de membros participantes deste CONTACT
        const groupIncludes = group.find(v => v.userId === userId);
        // O usuário possui acesso a loja || é 'manager' da loja que deste CONTACT 
        const storeIncludes = storeId && ((stores.includes(storeId) && level === 'superuser') || managerId === userId);
        // O usuário é 'supermanager' do projeto
        const projectIncludes = contact.project && level === 'supermanager' && project === contact.project;
    
        if (!groupIncludes && !storeIncludes && !projectIncludes) {
            res.status(400).send({error: `Denied access method: ${method}`});
            return
        }

        return {groupIncludes, storeIncludes, projectIncludes};

    } catch (err) {
        console.log(err)
        res.status(400).send({error: `Error Database | err:` + err});
        return
    }

};