# API AUTH

> A API AUTH SERVE COMO UM HUB DE FUNÇÕES E POLITICA DE PRIVACIDADE PADRÃO QUE PODE SER 
> UTILIZADO POR PROJETOS EXTERNOS. ENTRE AS FUNÇÕES OFERECIDAS ESTÃO CRUD DE USUÁRIOS,
> CONTROLE DE LOGIN E MANIPULAÇÃO POR LEVEL, RECUPERAÇÃO E SENHA, CADASTRO DE LOJAS E
> MUITO MAIS.

# DOCUMENTAÇÃO DA API

# USUÁRIOS - Regras

    admin           - controle sobre todos os usuários 'supermanager'
    supermanager    - controle sobre stores e users do seu projeto
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

// managerId = Referência do manager do qual aquele cadastro pertence

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
>BODY    :   _id    <br/>
>            ... (createAndUpdateMask format)    <br/>
> Caso alguma propriedade de 'attributes' esteja sendo atualizada, o sistema identificará quais props você
> está informando e atualizará apenas as respectivas chaves.

### 4. DELETE
>Method  :   DELETE    <br/>
>QUERY   :   _id    <br/>


## STORE
>
>ROUTE:      STORE     
>URL:        /store <br/>
>METHODS:    POST | GET | PUT | DELETE

createAndUpdateMask:
>
>           name            (string)                        Required
>           managerId       (string)                        Required from level (supermanager) (1) (2)
>           attributes      (object)                        Required
>           cpfCnpj         (string)                        Optional
>           telephone1      (string) Min 10 Máx 11          Optional
>           telephone2      (string) Min 10 Máx 11          Optional
>           whatsapp        (string) Min 10 Máx 11          Optional
>           address         (string)                        Optional
>           addressNumber   (string)                        Optional
>           addressComplement (string)                      Optional
>           addressRef      (string)                        Optional
>           district        (string)                        Optional
>           city            (string)                        Optional
>           uf              (string)                        Optional
>           cep             (string)                        Optional
>           type            (string)                        Optional (2) (3)
>           modules         (array)                         Optional (4)
>           project         (string)                        -------- (5) 
>           
>
> (1) - // ID do user que será próprietário da store. Necessário apenas caso você seja um 'supermanager',
> pois caso você seja um 'manager', esse valor será setado automáticamente.
> (2) - // Não é possível alterar este campo após a criação da loja, por isso, esse campo não é reconhecido
> se você solicitar atualização do arquivo. (method PUT)
> (3) - // Este campo pode ser utilizado para dividir as lojas por ramo/tipo.
> (4) - // Este campo pode ser utilizado para armazenar os modulos que a Loja pode acessar no site/app
> (5) - // Setado automaticamente. Não pode ser editado

queryMask:
>           cpfCnpj         (string)   
>           _id             (string)     
>           telephone1      (string) Min 10 Máx 11          
>           telephone2      (string) Min 10 Máx 11          
>           whatsapp        (string) Min 10 Máx 11
>           type            (string)
     
> Obs1. Usuário 'manager' podem acessar as lojas com mesmo 'managerId' que o seu.
> Obs2. Outros usuários podem acessar as lojas que constam nos seus cadastros.

## USER
>
>ROUTE:      USER     
>URL:        /user <br/>
>METHODS:    POST | GET | PUT | DELETE

createAndUpdateMask:
>            name            (string)                       Required
>            managerId       (string)                       Required from level (admin) and (supermanager) (1) (2)
>            managerName     (string)                       Optional
>            cpfCnpj         (string)                       Optional
>            birth           (string)                       Optional
>            telephone1      (string) Min 10 Máx 11         Optional
>            telephone2      (string) Min 10 Máx 11         Optional
>            email           (string)                       Required (2)
>            whatsapp        (string) Min 10 Máx 11         Optional
>            address         (string)                       Optional
>            addressNumber   (string)                       Optional
>            addressComplement (string)                     Optional
>            addressRef      (string)                       Optional
>            district        (string)                       Optional
>            city            (string)                       Optional 
>            uf              (string)                       Optional 
>            cep             (string)                       Optional 
>            password        (string)                       Required Min 6 Máx 20
>            level           (string)                       Required (3)
>            stores          (array)                        Optional (3)  
>            secrets         (array)                        Optional (4) 
>            
>            attributes      (object)                       Optional
>

> (1) - // ID do grupo que o usuário criado fará parte. Necessário apenas caso você seja um 'admin' ou 'supermanager',
> pois caso você seja outro level, esse valor será setado automáticamente.
> (2) - // Não é possível alterar este campo após a criação do user, por isso, esse campo não é reconhecido
> se você solicitar atualização do arquivo. (method PUT)
> (3) - Campos não podem ser alterados pelo próprio user, apenas por alguém de level superior.
> (4) - O campo secrets é utilizado para armazenar chaves secretas. Por este motivo, esta chave não é retornada
> quando você receber informações de um usuário. Apenas superusuários podem criar e editar.
> (5) - 'managerName' tem a função de "dar um nome para o grupo de usuários" pertencentes ao mesmo 'managerId'.
> Se não for informado, este campo será setado automáticamente com o nome do usuário 'manager' dono daquele grupo.
> Em teoria este campo só tem utilidade de preenchimento caso o usuário que estiver sendo cadastrado seja um 
> 'manager', pois isso permitirá a execução da função 'email_check' que pesquisa e retorna os nomes dos grupos
> que determinado email faz parte. 

queryMask:
>           managerName     (string) 
>           cpfCnpj         (string)                        
>           telephone1      (string) Min 10 Máx 11          
>           telephone2      (string) Min 10 Máx 11          
>           whatsapp        (string) Min 10 Máx 11  
>           attributes      (object)
>           managerId       (string)
>           secrets         (array)
>           stores          (array)                        
>           level           (string)                      

>   Obs1. Um user tem acesso somente a users de niveis inferiores.
>   Obs2. 'manager' podem ver todos do grupo
>   Obs3. 'superuser' e 'user' podem ver apenas usuários de suas lojas
>   Obs4. Caso o usuário a ser criado/manipulado seja do level 'admin' usar 'auth' como nome do projeto
>   Obs5.     QUERY:   'managerId'   Para criar usuários 'admin', 'supermanager', 'manager',informe 'admin' na QUERY. Para os outros tipos de usuário, >>   informe o managerId padrão da organização que você está manipulando.

## CONTACT
>
>ROUTE:      CONTACT     
>URL:        /contact <br/>
>METHODS:    POST | GET | PUT | DELETE
>DETAIL:     Este objecto pode ser utilizado para gerenciar CONTATOS entre usuários | lojas cadastradas.

createAndUpdateMask:
>            managerId              (string)        -------- (1) (No edit)    
>            managerName            (string)        -------- (1) (No edit)    
>            userId                 (string)        -------- (1) (No edit)    
>            userName               (string)        Required (8) (No edit)    
>            storeId                (string)        Optional (2) (No edit)    
>            storeName              (string)        -------- (7) (No edit)    
>            group [{               (array)         Optional (3) (9)
>                userId             (string)        Required
>                userName           (string)        Required
>            }]
>            status                 (boolean)       Optional (4)
>            score                  (number)        Optional (5)    
>            type                   (string)        Optional
>            title                  (string)        Optional
>            project                (string)        Optional (6) (No edit) 
>            attributes             (object)        Optional 
>
queryMask:
>
>            _id                    (string)
>            managerId              (string)
>            storeId                (string)
>            userId                 (string)
>            group                  (string)
>            status                 (boolean)
>            score                  (number)
>            type                   (string)
>            title                  (string)

> (1) - Setado aut. | Refere-se informações do criador deste objeto
> (2) - Este campo é opcional, caso seja preenchido, os membros tipo 'manager', 'superuser' e 'user'
>       com acesso a loja em questão também terão acesso aos dados deste objeto.
> (3) - Usuários que tem acesso aos dados deste objeto.
> (4) - Caso não seja informado, será setado automaticamente como 'true'. Caso seja setado como falso, pode 
>       considerar-se que aquele objeto é obsoleto|excluido|arquivado
> (5) - Pode ser utilizado em casos que este objeto é um 'atendimento ao cliente' que pode requerer
>       que o solicitante dê uma nota ao atendimento ao final.
> (6) - Os administradores do projeto também podem ter acesso as informações de 'CONTACT' se este campo for
>       informado.
> (7) - Setado aut se for informado um Id de uma loja válida.
> (8) - O solicitante pode informar o seu nome.
> (9) - Caso não seja enviado, será setado aut. como array vazia. Caso o usuário esteja logado, sua conta será 
>       automáticamente inclusa na prop 'group'.
> (10)- Campo setado automáticamente. Serve para armazenar informações de usuários com algum nível administrativo
>       sobre a conversa. Os dados são salvos quando o usuário manda a primeira mensagem.


policy:

>   POST - Live (1)
>   GET | PUT | DELETE -  (2) (3) (4)

> (1) - Rota de acesso livre.  (does not require authentication)
> (2) - Caso o usuário esteja incluso na propriedade 'group' que armazena os usuários que fazem 
>       parte e tem acesso a aquele grupo.
> (3) - Caso a propriedade 'storeId' esteja preenchida, os usuários 'manager' e 'superuser' que
>       possuirem acesso a esta loja também podem manipular o obj.
> (4) - Caso a propriedade 'project' esteja preenchida, os usuários 'supermanager' com acesso a
>       aquele projeto podem manipular o obj.


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

## PRODUCT

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