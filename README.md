DOCUMENTAÇÃO DA API

USUÁRIOS - Regras

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

REGRA 5 - Não é possível editar o managerId de uma store

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


# DOCUMENTAÇÃO

## Geral

### 1. CREATE    
>Method  :   POST    <br/>
>BODY    :   ... (createAndUpdateMask format)    <br/>

### 2. INDEX
>Method  :   GET    <br/>
>QUERY   :   page                        number     opcional   (Caso queira limitar os resultados)    <br/>
>            ... (queryMask format)    <br/>

### 3. EDIT
>Method  :   PUT    <br/>
>BODY    :   _id    <br/>
>            ... (createAndUpdateMask format)    <br/>

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
>           
>
> (1) - // ID do user que será próprietário da store. Necessário apenas caso você seja um 'supermanager',
> pois caso você seja um 'manager', esse valor será setado automáticamente.
> (2) - // Não é possível alterar este campo após a criação da loja, por isso, esse campo não é reconhecido
> se você solicitar atualização do arquivo. (method PUT)
>

queryMask:
>           cpfCnpj         (string)   
>           _id             (string)     
>           telephone1      (string) Min 10 Máx 11          
>           telephone2      (string) Min 10 Máx 11          
>           whatsapp        (string) Min 10 Máx 11
     
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
>            attributes      (object)                       Optional
>

> (1) - // ID do grupo que o usuário criado fará parte. Necessário apenas caso você seja um 'admin' ou 'supermanager',
> pois caso você seja outro level, esse valor será setado automáticamente.
> (2) - // Não é possível alterar este campo após a criação do user, por isso, esse campo não é reconhecido
> se você solicitar atualização do arquivo. (method PUT)
> (3) - Campos não podem ser alterados pelo próprio user, apenas por alguém de level superior.
>

queryMask:
>           cpfCnpj         (string)                        
>           telephone1      (string) Min 10 Máx 11          
>           telephone2      (string) Min 10 Máx 11          
>           whatsapp        (string) Min 10 Máx 11  
>           attributes      (object)

>   Obs1. Um user tem acesso somente a users de niveis inferiores.
>   Obs2. 'manager' podem ver todos do grupo
>   Obs3. 'superuser' e 'user' podem ver apenas usuários de suas lojas
>   Obs4. Caso o usuário a ser criado/manipulado seja do level 'admin' usar 'auth' como nome do projeto
>   Obs5.     QUERY:   'managerId'   Para criar usuários 'admin', 'supermanager', informe 'admin' na QUERY. Para os outros tipos de usuário, >  >   informe o managerId padrão da organização que você está manipulando.