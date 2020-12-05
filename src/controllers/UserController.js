const schema = require('../mongo/user');
const Mongo = require('./scripts/mongo');
const permission = require('../config/permission.json');
const {getRedis} = require('../services/redis');
const error      = require('./scripts/error');
const {Socket}= require('../services/socket')


async function query(req, res) {

    const {userData} = req;
    const { _id, level, managerId }  = userData;
 
    if (level === 'admin')
        return { level: 'supermanager'}

    if (level === 'supermanager')
        return { level: 'manager', creatorId: _id }

    // ACTION: Busca projeto no redis
    const project = await getRedis(userData.projectId, 'project');
    // ERRO: Projeto não encontrado
    if (!project) {
        error(req, res, 'Project not found: ' + userData.projectId);
        return 
    }
            
    const someQuery = {projectId: project._id};

    if (project.managerWorkspace)
        someQuery.managerId = managerId

    if (level === 'manager')
        someQuery.$or = [{level: 'superuser'}, {level: 'user'}, {level: 'client'}]

    if (level === 'superuser')
        someQuery.$or = [{level: 'user'}, {level: 'client'}];

    if (level === 'user')
        someQuery.$or = [{level: 'client'}];

    if (level === 'manager' || level === 'superuser' || level === 'user')
        return someQuery

    res.status(400).send({ error: 'Your level cannot index a users'});

};

module.exports = {

    async create(req, res) {

        const createdLevel = req.body.level;
        const projectId    = req.body.projectId || req.userData.projectId;
        const {level, _id: userId} = req.userData;

        //ACTION: POLÍTICA DE CRIAÇÃO DE USUÁRIOS 
        const case1   = level === 'admin'        && createdLevel === 'supermanager';
        const case2   = level === 'supermanager' && createdLevel === 'manager';
        const case3   = level === 'manager'      && (createdLevel === 'superuser'  || createdLevel === 'user' || createdLevel === 'client');
        const case4   = level === 'superuser'    && (createdLevel === 'user'       || createdLevel === 'client'   );
        const case5   = level === 'user'         && createdLevel === 'client';
      

        //ERRO: A REQUISIÇÃO NÃO SE ENQUADRA EM NENHUMA OPÇÃO DISPONÍVEL
        if (!case1 && !case2 && !case3 && !case4 && !case5)
            return res.status(400).send({ error: 'Your level cannot create a user of the informed level'});

        //ACTION: (CASES 2)       - 'projectId' deve ser informado 
        if(case2 && !projectId)
            return res.status(400).send({ error: 'Necessary to inform the property projectId'});
        //ACTION: (CASES 1,3,4,5) - Caso a requisição não seja 'case2', irá deletar projectId
        if(!case2)      
            delete req.body.projectId

        if (case2 || case3 || case4 || case5) {
 
            // ACTION: Busca projeto no redis
            const project = await getRedis(projectId, 'project');
            
            // ERRO: Projeto não encontrado
            if (!project)
                return error(req, res, 'Project not found: ' + projectId);

            req.projectData = project
            
        }


        //ACTION: (CASES 2) - Conferir permissões do projeto
        if (case2) {

            // ERRO: O usuário está tentando criar em um projeto que não lhe pertence
            if (req.projectData.supermanagerId !== userId)
                return error(req, res, 'You do not have access to the informed projectId: ' + projectId);
        } 
        
        //ACTION: Conferir permissões do projeto e manager workspace
        if (case3 || case4 || case5) {

            req.body.projectId = req.projectData._id
          
            //ACTION: Preencher 'managerId' automáticamente nos
            if (req.projectData.managerWorkspace)
                req.body.managerId = req.userData.managerId;
                
        }

        try {

            //ACTION: Check email duplicate in database
            /** 'admin' e 'supermanager' E-mail único no sistema                                    */
            /** 'manager' E-mail único por projeto                                                  */ 
            /** 'superuser', 'user' e 'client' (managerWorkspace inativo) E-mail único por projeto  */
            /** 'superuser', 'user' e 'client' (managerWorkspace ativo)   E-mail único por manager  */
            req.body.email = String(req.body.email).toLowerCase().trim();
            req.body.creatorId = userId;
            
            const query = (() => {
                const {email, projectId, managerId} = req.body
                if (case1)
                    return {email}
                if (case2 || !req.projectData.managerWorkspace)
                    return {email, projectId}
                if ((case3 || case4 || case5) && req.projectData.managerWorkspace)
                    return {email, projectId, managerId}
            })();

            if (await schema.findOne(query))
                return res.status(400).send({ error: 'User already exists'});

            const dataCreate = await Mongo.create(res, schema, req.body);
            const { _id } = dataCreate;
            // Se o usuário que está sendo cadastrado for um manager, o 'managerId' é o seu próprio ID
            if (createdLevel === 'manager') {
                await schema.findOneAndUpdate({ _id }, {
                    '$set': { managerId: _id}
                });
                dataCreate.managerId = _id
            }
            const {password, ...rest } = dataCreate

            if (case3 || case4 || case5 )
                Socket.emitPostUser(rest);

            //delete dataCreate.secrets;
            return res.send(rest);
        } catch(err) {
            return res.status(400).send({ error: 'Erro User Controller err: ' + err});
        };
    },

    async index(req, res) {

        //ERRO: A REQUISIÇÃO NÃO SE ENQUADRA EM NENHUMA OPÇÃO DISPONÍVEL
        const queryData = await query(req, req)
        if (!queryData) return

        req.query = {... req.query, ...queryData}
        res.send(await Mongo.index(res, schema, req.query, '-secrets'));
    },

    async edit(req, res, next) {
        const autoEdit = req.userData._id === req.body._id

        //ERRO: Se o usuário estiver tentando atualizar seu próprio cadastro
        if (autoEdit && req.body.level)
            return res.status(400).send({error: 'Error edit level'})

        if (!autoEdit) {
            //ERRO: A REQUISIÇÃO NÃO SE ENQUADRA EM NENHUMA OPÇÃO DISPONÍVEL
            const queryData = await query(req, req)
            if (!queryData) return
            req.query = {... req.query, ...queryData}
        }

        const data = await Mongo.edit(res, true, schema, req.body, req.query);
        Socket.emitPUT({...data, url: 'user'})
    },

    async delete(req, res) {

        //ERRO: A REQUISIÇÃO NÃO SE ENQUADRA EM NENHUMA OPÇÃO DISPONÍVEL
        const queryData = await query(req, req)
        if (!queryData) return

        req.query = {... req.query, ...queryData}
        const data = await Mongo.delete(res, true, schema, req.query);
     
        Socket.emitDELETE({...data, url: 'user'})
    },
};