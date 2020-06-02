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
QUERY   : managerId         (string)   Obrigatório para (superuser, manager)
BODY    :   email           (string)   Obrigatório para (todos)
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
USER

    QUERY:   'managerId'   Para criar usuários 'admin', 'supermanager', informe 'admin' na QUERY. Para os outros tipos de usuário, informe o managerId padrão da organização que você está manipulando.

=====================================================================================================
=====================================================================================================
=====================================================================================================

6. Intenção:
    Cadastrar novo usuário    
                         
auth    : Requer autenticação
Método  : post
QUERY   :   managerId       (string)   Obrigatório para ('admin' e 'supermanager') 
URL     : /user/<project>   (Caso o usuário a ser cadastrado seja do level 'admin' usar 'auth' como nome do projeto, em todos os outros 
                            casos, a requisição deve ser enviada para a url do projeto do qual o usuário fará parte)
BODY    :   name            (string)                    Obrigatório para (todos)
            cpfCnpj         (string) 
            birth           (string)

            telephone1      (string) Min 10 Máx 11
            telephone2      (string) Min 10 Máx 11
            email           (string)                    Obrigatório para (todos)
            whatsapp        (string) Min 10 Máx 11

            address         (string) 
            addressNumber   (string) 
            addressComplement (string)
            addressRef      (string)
            district        (string) 
            city            (string) 
            uf              (string) 
            cep             (string) 

            password        (string)                    Obrigatório para (todos) Min 6 Máx 20
            level           (string)                    Obrigatório para (todos)

            stores          (array)        
            attributes      (object)             

===========================================================================================================================

7. INTENÇÃO:
    Editar o perfil de um usuário

auth    : Requer autenticação
Método  : put
QUERY   :   managerId       (string)   Obrigatório para ('admin' e 'supermanager') 
URL     : /user/<project>   (Caso o usuário a ser cadastrado seja do level 'admin' usar 'auth' como nome do projeto, em todos os outros 
                            casos, a requisição deve ser enviada para a url do projeto do qual o usuário fará parte)

BODY    :   _id             (string)                    Obrigatório para (todos)    // ID do cadastro que o user quer editar
            name            (string) 
            cpfCnpj         (string) 
            birth           (string)

            telephone1      (string) Min 10 Máx 11
            telephone2      (string) Min 10 Máx 11
            email           (string) Obrigatório
            whatsapp        (string) Min 10 Máx 11

            address         (string) 
            addressNumber   (string) 
            addressComplement (string)
            addressRef      (string)
            district        (string) 
            city            (string) 
            uf              (string) 
            cep             (string) 

            password        (string) 
            level           (string) 

            stores          (array)
            attributes      (object)  

===========================================================================================================================


8. INTENÇÃO:
    Deletar um usuário

auth    : Requer autenticação
Método  : delete
QUERY   :   managerId       (string)   Obrigatório para ('admin' e 'supermanager') 
URL     : /user/<project>   (Caso o usuário a ser cadastrado seja do level 'admin' usar 'auth' como nome do projeto, em todos os outros 
                            casos, a requisição deve ser enviada para a url do projeto do qual o usuário fará parte)
PARAM   : _id               Obrigatório para (todos)    // ID do cadastro que o user quer apagar


9. INTENÇÃO:
    Listar usuários

auth    : Requer autenticação
Método  : get
URL     : /user/<project>
QUERY   : page                  (number)       Obrigatório para (todos)

Obs1. Serão listados sempre usuários de níveis inferiores
Obs2. 'manager' podem ver todos do grupo
Obs3. 'superuser' e 'user' podem ver apenas usuários de suas lojas

=====================================================================================================
=====================================================================================================
=====================================================================================================
STORE
=====================================================================================================
=====================================================================================================
=====================================================================================================

10. INTENÇÃO:
    Cadastrar nova loja

auth    : Requer autenticação
Método  : post
URL     : /store/<project>
QUERY   :   managerId       (string)                        Obrigatório para (supermanager)  // ID do usuário próprietário da loja
BODY    :   name            (string)                        Obrigatório para (todos)
            cpfCnpj         (string) 

            telephone1      (string) Min 10 Máx 11
            telephone2      (string) Min 10 Máx 11
            whatsapp        (string) Min 10 Máx 11

            address         (string) 
            addressNumber   (string) 
            addressComplement (string)
            addressRef      (string)
            district        (string) 
            city            (string) 
            uf              (string) 
            cep             (string)

            attributes      (object) 

=============================================================================================================================

11. Intenção
    Editar loja

auth    : Requer autenticação
Método  : put
URL     : /store/<project>
QUERY   :   storeId         (string)                 Obrigatório para (todos)
BODY    :   name            (string) 
            cpfCnpj         (string) 

            telephone1      (string) Min 10 Máx 11
            telephone2      (string) Min 10 Máx 11
            whatsapp        (string) Min 10 Máx 11

            address         (string) 
            addressNumber   (string) 
            addressComplement (string)
            addressRef      (string)
            district        (string) 
            city            (string) 
            uf              (string) 
            cep             (string)

            attributes      (object) 

================================================================================================================================

12. Intenção:
    Deletar uma loja

auth    : Requer autenticação
Método  : delete
URL     : /store/<project>
QUERY   : storeId                (string)                Obrigatório para (todos)


================================================================================================================================

13. Intenção:
    Listar uma loja

auth    : Requer autenticação
Método  : get
URL     : /store/<project>
QUERY   : stores                (array)        Obrigatório para (todos, menos para o manager) //Ids das lojas a baixar
          page                  (number)       Obrigatório para (todos)

          Obs: Somente para usuarios 'manager' Se não informar ids na array 'stores', irá baixar todas as suas lojas