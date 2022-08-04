# API AUTH

> A API AUTH SERVE COMO UM HUB DE FUNÇÕES E POLITICA DE PRIVACIDADE PADRÃO QUE PODE SER 
> UTILIZADO POR PROJETOS EXTERNOS. ENTRE AS FUNÇÕES OFERECIDAS ESTÃO CRUD DE USUÁRIOS,
> CONTROLE DE LOGIN E MANIPULAÇÃO POR LEVEL, RECUPERAÇÃO E SENHA, CADASTRO DE LOJAS E
> MUITO MAIS.

# DOCUMENTAÇÃO DA API

# USUÁRIOS - Regras

    admin           - controle sobre todos os usuários 'supermanager'
    supermanager    - controle users dos seus projetos
    manager         - controle sobre suas stores e sub-users
    superuser       - controle sobre suas stores e sub-users
    user            - sem controle relevante
    client          - sem controle relevante

    ** Todos os usuários podem editar seus perfis

    Usuários 'manager'  podem ter várias lojas
    Usuários 'superuser' podem acessar as lojas que o 'manager' autorizar

REGRA 1 - Usuários 'admin' devem utilizar 'auth' como nome de projeto
        - Outros usuários devem utilizar o projeto a qual pertencem

REGRA 2 - Usuários 'admin' devem ser usados exclusivamente para criar e gerenciar usuários 'supermanager'

REGRA 3 - Usuários 'supermanager' podem gerenciar todos os usuários e stores do seu projeto

REGRA 4 - Usuários 'supermanager' são os únicos que podem criar e deletar 'stores' 

REGRA 5 - Não é possível editar o (managerId || type) de uma store

REGRA 6 - Nas rotas onde a QUERY 'managerId' é obrigatória.
    // 'admin' e 'supermanager' devem informar o valor 'admin'
    // Outros devem informar o 'managerId' da organização (O ID DO MANAGER)


=====================================================================================================
=====================================================================================================
=====================================================================================================
AUTH
=====================================================================================================
=====================================================================================================
=====================================================================================================

1. Intenção:
    Autenticar ao sistema utilizando email e senha

auth    : Não requer autenticação
Método  : post
URL     : /auth/<project>   (Se você for admin, usar 'auth' como nome de projeto)
BODY   :  managerId       (string)   Obrigatório para (superuser, manager)
          email           (string)   Obrigatório para (todos)
          password        (string)   Obrigatório para (todos)
          projectId       (string)   Obrigatório para (manager, superuser, user, client)

OBS: Usuários "manager" devem informar o seu próprio id no campo "managerId"

==================================================================================================

2. Intenção:
    Verificar se estou autenticado ao sistema

auth    : requer autenticação
Método  : get
URL     : /auth/<project>   (Se você for admin, usar 'auth' como nome de projeto)

===================================================================================================

3. Intenção:
    Fazer logout do sistema:

auth    : requer autenticação
Método  : delete
URL     : /auth/<project>   (Se você for admin, usar 'auth' como nome de projeto)


=====================================================================================================
=====================================================================================================
=====================================================================================================
FORGOT PASSWORD
=====================================================================================================
=====================================================================================================
=====================================================================================================


4. Intenção:
    Recuperar senha utilizando o e-mail                 

auth    : Não requer autenticação
Método  : post
URL     : /forgot_password/<project>   (Se você for admin, usar 'auth' como nome de projeto)
QUERY   :   managerId       (string)   Obrigatório para (todos) 
BODY    :   email           (string)   Obrigatório para (todos)

=====================================================================================================
=====================================================================================================
=====================================================================================================
RESET PASSWORD
=====================================================================================================
=====================================================================================================
=====================================================================================================


5. Intenção:
    Editar senha utilizando Token de recuperação        - 

auth    : Não requer autenticação
Método  : post
URL     : /reset_password/<project>    (Se você for admin, usar 'auth' como nome de projeto)
QUERY   :   managerId       (string)   Obrigatório para (client, user, superuser, manager)
BODY    :   email           (string)   Obrigatório para (todos)
            token           (string)   Obrigatório para (todos)
            password        (string)   Obrigatório para (todos)  Min 6 Máx 20


=====================================================================================================
=====================================================================================================
=====================================================================================================
EMAIL CHECK
=====================================================================================================
=====================================================================================================
=====================================================================================================

6. Intenção:
    Faz uma pesquisa e retorna os grupos que aquele determinado email faz parte

auth    : Não requer autenticação
Método  : post
URL     : /email_check/<project>    (Se você for admin, usar 'auth' como nome de projeto)
BODY    : email           (string)   Obrigatório para (todos)

OBS: Não retorna informações caso o email seja 'admin' || 'supermanager'

=====================================================================================================
=====================================================================================================
=====================================================================================================


# DOCUMENTAÇÃO

## Geral

### 1. CREATE    
>Method  :   POST    <br/>
>BODY    :   ... (createAndUpdateMask format)    <br/>

### 2. INDEX
>Method  :   GET    <br/>
>QUERY   :   page                        number     opcional   (Caso queira limitar os resultados)    <br/>
>            skip                        number     optional   (Caso queira pular determinado número de itens) <br/>
>            createdAt                   object     opcional   (filtrar por data de criação)   (1)    <br/>
>            updatedAt                   object     opcional   (filtrar por data de update)    (1)    <br/>
>            ... (queryMask format)    <br/>

> (1) - exemplo intervalo entre datas:
>            { $gte: '1987-10-19', $lte: '1987-10-26' }

### 3. EDIT
>Method  :   PUT    <br/>
>QUERY   :   editSubKey     (boolean)      (1)  <br/>
>BODY    :   _id            (string)            <br/>
>            ... (createAndUpdateMask format)   <br/>

> (1) - Este parâmetro permite utilizar o salvamento inteligente de informações.
>       false  - Substitui os parâmetros informados em 'body'
>       true   - Substitui apenas os parâmetros filhos dos parâmetros informados em 'body'
>       Obs: Se não informado, será setado aut. como 'true'


### 4. DELETE
>Method  :   DELETE    <br/>
>QUERY   :   _id    <br/>


## USER

>ROUTE:      USER     
>URL:        /user <br/>
>METHODS:    POST | GET | PUT | DELETE

Object:
>   parameter:          type:       GET:        POST:        PUT:     
>   -------------------------------------------------------------------------------------------- 
>   creatorId           (string)                Set. aut     (No edit)
>   managerId           (string)                Set aut.     (No edit)       (2)
>   projectId           (string)                Required (4) (No edit)       (5)
>   name                (string)                Required     
>   email               (string)                Required     (No edit)
>   password            (string)                Required                    Min 6 Máx 20
>   level               (string)                Required                    (3)
>   managerName         (string)                Optional                    (7)
>   attributes          (object)                Required                    


> (1) É possível manipular apenas usuários de níveis inferiores
> (2) Um supermanager só pode manipular users 'manager' com que tiverem o seu mesmo 'supermanagerId'
> (3) Em projetos 'managerWorkspace' usuários 'manager' e abaixo só podem manipular outros com o seu mesmo 'managerId'

> (4) Required from level 'supermanager' (on create users 'manager')
> (5) Separar usuários ('manager' e subordinados) entre os projetos.
>   - Usuários 'admin' e 'superuser' não utilizam este campo.
> (6) Separar usuários ('manager' e subordinados) dentro do próprio projeto.
>   - Usuários 'admin', 'superuser', 'manager' e projetos c/prop ('managerWorkspace' === false), não utilizam este campo.
> (7) Utilizado para nomear um workspace de determinado manager
>REGRA 1 - Usuários 'admin' devem utilizar 'auth' como nome de projeto
>        - Outros usuários devem utilizar o projeto a qual pertencem




> (4) - O campo secrets é utilizado para armazenar chaves secretas. Por este motivo, esta chave não é retornada
> quando você receber informações de um usuário. Apenas superusuários podem criar e editar.
> (5) - 'managerName' tem a função de "dar um nome para o grupo de usuários" pertencentes ao mesmo 'managerId'.
> Se não for informado, este campo será setado automáticamente com o nome do usuário 'manager' dono daquele grupo.
> Em teoria este campo só tem utilidade de preenchimento caso o usuário que estiver sendo cadastrado seja um 
> 'manager', pois isso permitirá a execução da função 'email_check' que pesquisa e retorna os nomes dos grupos
> que determinado email faz parte. 


## PROJECT
>ROUTE:      PROJECT
>URL:        /project <br/>
>METHODS:    POST | GET | PUT | DELETE - Required from level (supermanager of project) 

Object:
>   parameter:          type:       GET:        POST:        PUT:     
>   -------------------------------------------------------------------------------------------- 
>   name                (string)    true        Required
>   supermanagerId      (string)    true        Set aut.     (No edit)
>   status              (boolean)   true        Required     
>   statusAdmin         (boolean)   true        Set aut.     
>   managerWorkspace    (boolean)               Required     (No edit)      (1)

> (1) - Se 'true', cada 'manager' do projeto terá seu próprio espaço. Isso permite que um usuário 
> tenha um mesmo e-mail cadastrado em vários 'managers' diferentes de um mesmo projeto.

## ROUTE
>ROUTE:      ROUTE     
>URL:        /route <br/>
>METHODS:    POST | GET | PUT | DELETE - Required from level (supermanager of project)

Object:
>   parameter:          type:       GET:        POST:        PUT:                 VALUES:
>   -------------------------------------------------------------------------------------------- 
>   url                 (string)                Required     (No edit)
>   projectId           (string)    true        Required     (No edit)
>   supermanagerId      (string)                set.aut      (No edit)
>   methods             (array)                 Required                 (1)
>   policy              (object)                Required                 (2)

>   preDatabase         (object)                Optional                 (3)
>   posDatabase         (object)                Optional                 (4)

>   params              (object)                Required                 (5)
>   modelDb             (object)                Optional                 (6)
>   status              (boolean)   true        Optional     
>   redis               (boolean)               Optional                 (7)
>   socket              (boolean)               Optional                 (8)
>   socketQueryStart    (object)                Optional                 (9)
>   socketCreatePolicy  (string-Function)       Optional                 (10)


> (1) - ex. methods: [ "get", "put", "delete" ] <-- Contém os methods ativados para esta rota
> (2) ex. policy: {
>       post:    [ "manager", "superuser"],     <-- A array contem os leveis que podem acessar o method
>       get:     [ "manager" ],
>       put:     [ "manager" ],
>       delete:  [ "manager" ],
>   }
> (3) ex. preDatabase: {
>       post:   () => {},           <-- Função que será executada antes da operação no banco de dados
>       get:    () => {},       
>       put:    () => {},
>       delete: () => {}
>   }
> (4) - Mesma coisa de 'preDatabase', porém a função será executada após a operação no banco de dados
> (5) - Contém as validações de body e query das requisições utilizando o modulo NPM 'celebrate'.
>   ex: params: {
>       post:   celebrate({
>           [Segments.BODY]: Joi.object().keys({
>               param1:      Joi.string().required(),
>               param2:      Joi.array(),
>           }),
>           [Segments.QUERY]: Joi.object().keys({
>               param1:      Joi.number(),
>           }),
>       }),
>       get:    ...,       
>       put:    ...,
>       delete: ...,
>   }
> (6) - Contem o modelo de organização deste objeto no banco de dados.
>   ex: modelDb: {
>        param1:   'Object',
>        param2:   'Boolean',
>        param3:   'String',    
>   }
> (7) - Informa se este objeto deve ser salvo/atualizado/excluido na memória 'REDIS' para acesso instântaneo.
> (8) - Define se esta collection é sincronizada possui sincronização por socket. (DEFAULT: false)
> (9) - Define parametros para que a pesquisa retorne os items iniciais (ao socket conectar)
> (10)- Define limites para quem deve receber uma atualização quando um novo item for criado nesta collection.












## CONTACT
>
>ROUTE:      CONTACT     
>URL:        /contact <br/>
>METHODS:    POST | GET | PUT | DELETE
>DETAIL:     Este objecto pode ser utilizado para gerenciar CONTATOS entre usuários | lojas cadastradas.

createAndUpdateMask:
>            managerId              (string)        -------- (1) (No edit)     
>            creatorId              (string)        -------- (1) (No edit)        
>            group [{               (array)         Optional (3) (9)
>                userId             (string)        Required
>                userName           (string)        Required
>            }]
>            status                 (boolean)       Optional (4)
>            score                  (number)        Optional (5)    
>            type                   (string)        Optional (2)
>            title                  (string)        Optional
>
queryMask:
>
>            _id                    (string)
>            managerId              (string)
>            creatorId              (string)
>            group                  (string)
>            status                 (boolean)
>            score                  (number)
>            type                   (string)
>            title                  (string)

> (1) - Setado aut. | Refere-se informações do criador deste objeto
> (2) - Tipo do contato
>       - sac    - contato de um user do aplicativo ao supermanager do projeto
>       - team   - conversa entre duas ou mais pessoas de um managerId
 
> (3) - Usuários que tem acesso aos dados deste objeto.
> (4) - Caso não seja informado, será setado automaticamente como 'true'. Caso seja setado como falso, pode 
>       considerar-se que aquele objeto é obsoleto|excluido|arquivado
> (5) - Pode ser utilizado em casos que este objeto é um 'atendimento ao cliente' que pode requerer
>       que o solicitante dê uma nota ao atendimento ao final.
> (9) - Caso não seja enviado, será setado aut. como array vazia. Caso o usuário esteja logado, sua conta será 
>       automáticamente inclusa na prop 'group'.


policy:

>   POST - Live (1)
>   GET | PUT | DELETE -  (2)

> (1) - Rota de acesso livre.  (does not require authentication)
> (2) - Caso o usuário esteja incluso na propriedade 'group' que armazena os usuários que fazem 
>       parte e tem acesso a aquele grupo.

## MESSAGE

>
>ROUTE:      MESSAGE     
>URL:        /message <br/>
>METHODS:    POST | GET | DELETE
>DETAIL:     Este objecto pode ser utilizado para armazenar mensagens de um 'CONTACT'

createAndUpdateMsk:
>
>                contactId          (string)    Required (2) (No edit)
>                message            (string)    Required     (No edit)
>                usersGet           (array)     -------- (5) 
>                usersView          (array)     -------- (6) 
>                userId             (string)    -------- (1) (No edit)
>                userName           (string)    -------- (4) (No edit)


queryMask
>
>               _id                 (string)
>               userId              (string)  
>               contactId           (string)    Required (3)
>

> (1) - Setado aut. | Refere-se informações do criador deste objeto
> (2) - ID do arquivo em CONTACT detentor do conjunto de mensagens
> (3) - Informando o 'contactId' da solicitação
> (4) - Setado aut. caso o usuário tenha apenas acesso administrativo ao 'CONTACT', ou seja,
>       não está em 'group' propriedade. Serve para identificar o usuário ADM no chat
> (5) - Setado aut. - Armazena o ID dos usuários que receberam a mensagem 
> (6) - Setado aut. - Armazena o ID dos usuários que leram a mensagem
>

policy:
>
>   POST | GET -     (1) (2) (3)
>   DELETE - (4)
>   PUT    - (5)
>
> (1) - Caso o usuário esteja incluso na propriedade 'group' que armazena os usuários que fazem 
>       parte e tem acesso a aquele grupo.
> (2) - Caso a propriedade 'storeId' esteja preenchida, os usuários 'manager' e 'superuser' que
>       possuirem acesso a esta loja também podem manipular o obj.
> (3) - Caso a propriedade 'project' esteja preenchida, os usuários 'supermanager' com acesso a
>       aquele projeto podem manipular o obj.
> (4) - Apenas o usuário que criou o obj pode apagá-lo
> (5) - Nos campos 'usersGet' e 'usersView' não é possível deletar IDS. Os dados informados nestes
>       campos através de PUT é apenas adicionada ao restante. 
>       1. É possível incluir apenas o seu próprio ID.
>       2. Independente do valor informado na array, o sistema substituira por uma array com o ID do usuário



## PROCEDIMENTOS

### CRIAR NOVA PROPRIEDADE PARA UM SCHEMA MONGO

>> Em './README.md', atualize a documentação realizando as devidas adições/alterações e observações
>>  1. adicione a propriedade no objecto do 'createAndUpdateMask' do schema que esta sendo editado
>>  2. (opcional) - Caso o campo esteja disponível para pesquisa, adicione-o também em 'queryMask'
>>
>> Em './src/routes' Acesse o conjunto de rotas do schema e adicione a nova propriedade em 'POST' E 'PUT'
>>  1. (Opcional) - Se a propriedade estiver disponível para pesquisa, adicione-a também em 'GET'
>>
>> Em './src/mongo' Busque o schema e adicione a nova propriedade.
>>
>> OBS: Caso a propriedade só possa ser criada/editada sob determindas condições, precise de 
>>      Preenchimento aut/Edição antes de salvar ou coisas do tipo, realize tais alterações
>>      em './src/controllers' seguindo o modelo. Não esqueça de anotar as observações/restrições
>>      na documentação da Api
>>
>> Teste a rota
>> Realize as alterações necessárias no JTEST





### Criando um projeto do zero com exemplos praticos
## Criando um projeto básico

# 0. Criando um admin
# 1. Criando o superManager
>>
>>
>> 1. Faça login de um user "admin
>> 2. Envie um "POST" para a url .../auth/user com o body JSON
>>
>> REQ
>> {
>>		"name": "Joao da silva",
>>		"email":"joao@gmail.com",
>>		"password": "senha",
>>		"level": "supermanager",
>>		"attributes": {},
>>		"projectId": "auth"
>> }
>>
>> RES
>>{
>>  "_id": "618c5004e45G5675acbcfbf1",
>> "name": "Joao da silva",
>>  "email": "joao@gmail.com",
>>  "level": "supermanager",
>>  "attributes": {},
>>  "creatorId": "5ed4327e7445KK157822493c",
>>  "createdAt": "2021-11-10T23:04:36.248Z",
>>  "updatedAt": "2021-11-10T23:04:36.248Z",
>>  "__v": 0
>> }
>>
>>

# 2. Criando o projeto
>>
>> 1. Faça login de um user "supermanager"
>> 2. Envie um "Post" para a url .../auth/project com o body JSON
>>
>> REQ
>> { 
>>	"name": "nome_do_projeto",
>>	"status": true,
>>	"managerWorkspace": true
>> }
>>
>> RES
>>
>> {
>>  "_id": "618c5e4475F3615acbcfbf2",
>>  "name": "nome_do_projeto",
>>  "status": true,
>>  "managerWorkspace": true,
>>  "supermanagerId": "618c5004e0eb6615acbcfbf1",
>>  "statusAdmin": true,
>>  "createdAt": "2021-11-10T23:08:02.462Z",
>>  "updatedAt": "2021-11-10T23:08:02.462Z",
>>  "__v": 0
>> }
>>
# 3. Criando um manager
>>
>> {
>>		"name": "exeplo a",
>>		"email":"exemplo+manager@gmail.com",
>>		"password": "123456",
>>		"level": "manager",
>>		"attributes": {},
>>		"projectId": "618c51e8e3cd6615acbcfbf3"
>> }
>>

# 4. Criando um superuser
# 5. Criando um user
# 6. Criando a rota contact
# 7. Criando a rota message
# 8. Criando a rota store
# 9. Criando uma rota personalizada
>>
>> REQ
>> {
>>   "status": true,
>>    "redis": true,
>>    "socket": true,
>>    "url": "vehicles",
>>    "projectId": "618c51e8e0eb6615acbcfbf3",
>>    "methods": [
>>      "post",
>>      "get",
>>      "put",
>>			"delete"
>>    ],
>>    "policy": {
>>      "post": [
>>        "manager"
>>      ],
>>      "get": [
>>        "manager",
>>        "superuser",
>>        "user",
>>        "client"
>>      ],
>>      "put": [
>>        "manager",
>>        "superuser"
>>      ],
>>      "delete": [
>>        "manager"
>>      ]
>>    },
>>    "preDatabase": {
>>      "post": "async () => { }"
>>    },
>>   "params": {
>>      "post": "celebrate({[Segments.BODY]:Joi.object().keys({  attributes: Joi.object(),  name: Joi.string(), content: Joi.Object(), })})",
>>      "get": "celebrate({[Segments.QUERY]:Joi.object().keys({page:Joi.number(),skip:Joi.number(),createdAt:      Joi.object(),updatedAt:Joi.>>    object(),_id:Joi.string(), name: Joi.string(),  })})",
>>      "put": "celebrate({[Segments.BODY]:Joi.object().keys({ _id:Joi.string().required(),    attributes: Joi.object(), name: Joi.string(), >> >>      content: Joi.object(),  }),})"
>>    },
>>    "modelDb": {
>>      "attributes": "Object",
>>      "name": 		 	"String",
>>			"content": 		"Object"
>>    },
>>    "type": "route"
>>  }
>>
>> RES 
>>{
>>  "status": true,
>>  "redis": true,
>>  "socket": true,
>>  "_id": "618c5397e0eb6615acbcfbf4",
>>  "url": "vehicles",
>>  "projectId": "618c51e8e0eb6615acbcfbf3",
>>  "methods": [
>>    "post",
>>    "get",
>>    "put",
>>    "delete"
>>  ],
>>  "policy": {
>>    "post": [
>>      "manager"
>>    ],
>>    "get": [
>>      "manager",
>>      "superuser",
>>      "user",
>>      "client"
>>    ],
>>    "put": [
>>      "manager",
>>      "superuser"
>>    ],
>>    "delete": [
>>      "manager"
>>    ]
>>  },
>>  "preDatabase": {
>>    "post": "async () => { }"
>>  },
>>  "params": {
>>    "post": "celebrate({[Segments.BODY]:Joi.object().keys({  attributes: Joi.object(),  name: Joi.string(), content: Joi.Object(), })})",
>>    "get": "celebrate({[Segments.QUERY]:Joi.object().keys({page:Joi.number(),skip:Joi.number(),createdAt:      Joi.object(),updatedAt:Joi.object >>   (),_id:Joi.string(), name: Joi.string(),  })})",
>>    "put": "celebrate({[Segments.BODY]:Joi.object().keys({ _id:Joi.string().required(),    attributes: Joi.object(), name: Joi.string(), >>content: Joi.object(),  }),})"
>>  },
>>  "modelDb": {
>>    "attributes": "Object",
>>    "name": "String",
>>    "content": "Object"
>>  },
>>  "type": "route",
>>  "supermanagerId": "5fbc7843d46b9f2e24f1bcc1",
>>  "createdAt": "2021-11-10T23:19:51.862Z",
>>  "updatedAt": "2021-11-10T23:19:51.862Z",
>>  "__v": 0
>> }

# CRIANDO UM OBJETO NA ROTA CRIADA
##
>> 1. Faça login utilizando um usuário "manager"
>>
>>
>>
>>
>>
>>
>>
>>
>>
>>
>>
>>
>>

# Project meugps
# dev - supermanager
>>	"email" : "nordesterastreamento+flows@gmail.com",
>>	"password": "123456"
# Criada route devices - "url": "devices"
>>
>> A rota devices é responsável por armazenar as informações dos veículos cadastrados e sua última posição no mapa
>>
>>  POST
>>  GET
>>  PUT
>>  DELETE
>>
>> A rota devicesHistory é responsável por armazenar o histórico de localizações dos devices
>>  POST
>>  GET
>>

#  
#