const express = require('express');
const axios = require('axios') ;

const projectConfig = require('./config/project.json')

const UserController = require('./controllers/UserController');
const StoreController = require('./controllers/StoreController');
const AuthController = require('./controllers/AuthController');
const ForgotPassword = require('./controllers/ForgotPassword');
const ResetPassword = require('./controllers/ResetPassword');

const authMiddleware = require('./middlewares/auth');
const permissionMiddleware = require('./middlewares/permission');

const { celebrate, Segments, Joi } = require('celebrate');

const routes  = express.Router();



	// ====================================================
	// ====================================================
	// ROTAS ABERTAS
	// ====================================================
	// ====================================================

	// RECUPERAÇÃO DE SENHA
	routes.post('/forgot_password/*', celebrate({	

		[Segments.QUERY]: 	Joi.object().keys({
			managerId: 		Joi.string().required()
		}),
		[Segments.BODY]: 	Joi.object().keys({
			email: 			Joi.string().required().email(),
		})

	}), ForgotPassword.create); 

	// RESET DE SENHA
	routes.post('/reset_password/*', celebrate({

		[Segments.QUERY]: 	Joi.object().keys({
			managerId: 		Joi.string().required()
		}),

		[Segments.BODY]: 	Joi.object().keys({
			email: 			Joi.string().required().email(),
			token: 			Joi.string().required(),
			password: 		Joi.string().required().min(6).max(20)
		})
	}), ResetPassword.create); 


	// AUTENTICAÇÃO
	routes.post('/auth/*', celebrate({
		[Segments.QUERY]: 	Joi.object().keys({
			managerId: 		Joi.string().required()
		}),

		[Segments.BODY]: 	Joi.object().keys({
			email:  		Joi.string().required(),
			password:  		Joi.string().required(),
		})

	}), AuthController.create); 




	// ====================================================
	// ====================================================
	// FECHADAS
	// ====================================================
	// ====================================================

	// 'authMiddleware' Verifica se o usuário possui um token válido.
	// 'permissionMiddleware' Verifica se o usuário possui autorização para fazer o que quer. 


	// CHECK AUTENTICAÇÃO
	routes.get('/auth/*', authMiddleware, AuthController.index); 

	// DELETAR AUTENTICAÇÃO
	routes.delete('/auth/*', authMiddleware, AuthController.delete); 



	// CADASTRO DE USUÁRIOS

	routes.post('/user/*', authMiddleware, permissionMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({

			name:           Joi.string().required(),
			cpfCnpj:        Joi.string(),
			birth:          Joi.string(),
	
			telephone1:     Joi.string().min(10).max(11),
			telephone2:     Joi.string().min(10).max(11),
			email:          Joi.string().required().email(),
			whatsapp:       Joi.string().min(10).max(11),
	
			address:        Joi.string(),
			addressNumber: 	Joi.string(),
			addressComplement: Joi.string(),
			addressRef:     Joi.string(),
			district:       Joi.string(),
			city:           Joi.string(),
			uf:             Joi.string().length(2),
			cep:            Joi.string().min(8).max(9),

			password:       Joi.string().required().min(6).max(20),
			level: 			Joi.string().required(),
			stores:			Joi.array(),

			attributes:		Joi.object()

		})

	}), UserController.create); 
	

	routes.get('/user/*', authMiddleware , permissionMiddleware, celebrate({

		[Segments.QUERY]: 	Joi.object().keys({
			managerId: 		Joi.string().required()
		}),

		[Segments.QUERY]: Joi.object().keys({
			page: Joi.string().required()
		}),

	}), UserController.index); 

	










	routes.put('/user/*', authMiddleware, permissionMiddleware, celebrate({

		[Segments.QUERY]: 	Joi.object().keys({
			managerId: 		Joi.string().required()
		}),


		[Segments.BODY]: Joi.object().keys({

			name:           Joi.string().required(),
			cpfCnpj:        Joi.string(),
			birth:          Joi.string(),
	
			telephone1:     Joi.string().min(10).max(11),
			telephone2:     Joi.string().min(10).max(11),
			email:          Joi.string().required().email(),
			whatsapp:       Joi.string().min(10).max(11),
	
			address:        Joi.string(),
			addressNumber: Joi.string(),
			addressComplement: Joi.string(),
			addressRef:     Joi.string(),
			district:       Joi.string(),
			city:           Joi.string(),
			uf:             Joi.string().length(2),
			cep:            Joi.string().min(8).max(9),

			password:       Joi.string().required().min(6).max(20),
			level: 			Joi.string().required(),					//'admin', 'manager' and 'user'
			stores:			Joi.array(),

			attributes:		Joi.object(),

		})

	}), UserController.edit); 


	routes.delete('/user/*', authMiddleware, permissionMiddleware, celebrate({

		[Segments.PARAMS]: Joi.object().keys({
			id:  Joi.string().required()
		}),
		
	}), UserController.delete); 






	// CADASTRO DE LOJAS, EDIÇÃO E DELEÇÃO

	routes.post('/store/*', authMiddleware, permissionMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({

			name:           Joi.string().required(),
			cpfCnpj:        Joi.string(),
	
			telephone1:     Joi.string().min(10).max(11),
			telephone2:     Joi.string().min(10).max(11),
			whatsapp:       Joi.string().min(10).max(11),
	
			address:        Joi.string(),
			addressNumber: Joi.string(),
			addressComplement: Joi.string(),
			addressRef:     Joi.string(),
			district:       Joi.string(),
			city:           Joi.string(),
			uf:             Joi.string().length(2),
			cep:            Joi.string().min(8).max(9),

			managerId:		Joi.string().required(),						// ID do user Manager proprietario da loja
		
			attributes:		Joi.object(),
		})


	}), StoreController.create); 

	
	routes.put('/store/*', authMiddleware, permissionMiddleware, celebrate({

		[Segments.QUERY]: Joi.object().keys({
			storeId:  Joi.string().required()
		}),

		[Segments.BODY]: Joi.object().keys({

			name:           Joi.string(),
			cpfCnpj:        Joi.string(),
	
			telephone1:     Joi.string().min(10).max(11),
			telephone2:     Joi.string().min(10).max(11),
			whatsapp:       Joi.string().min(10).max(11),
	
			address:        Joi.string(),
			addressNumber: Joi.string(),
			addressComplement: Joi.string(),
			addressRef:     Joi.string(),
			district:       Joi.string(),
			city:           Joi.string(),
			uf:             Joi.string().length(2),
			cep:            Joi.string().min(8).max(9),
			attributes: 	Joi.object(),

		})
	}), StoreController.edit); 

	routes.delete('/store/*', authMiddleware, permissionMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			storeId:  Joi.string().required()
		})
	}), StoreController.delete); 


	// Redirecionamento para as APIS de projeto

	projectConfig.map(Project => {
		
		routes.all(`/${Project.name}/*`, async function (req, res) {

			// Cria chaves no cabeçalho QUERY com as variáveis decodificadas do token
			const {userId, managerId, level, project} = req;
			const params = { params: { userId, managerId, level, project } };

			// Caso o usuário tenha informado mais alguma QUERY, adicionar
			for (const prop in req.query) {
				params.params[prop] = req.query[prop]
			}

			// Corpo da requisição (Apenas em POST ou PUT)
			const data = { data: req.body };

			const baseURL = axios.create({
				baseURL: `http://localhost:${project.port}/`,
			});


			try {
				const newRoute 	= req.params[0]
				const method 	= req.method;

				if (method == 'GET') 
					resApi = await baseURL.get(newRoute, null, params)

				if (method == 'POST')
					resApi = await baseURL.post(newRoute, data, params)

				if (method == 'PUT')
					resApi = await baseURL.put(newRoute, data, params)

				if (method == 'DELETE')
					resApi = await baseURL.delete(newRoute, null, params)

			} catch (err) {

				const status = err.response.data

				res.status(status.statusCode).send({ 
					error: 'Internal api error - ' + status.message 
				})

			}

		
		});

	});


module.exports = routes;        // Permite a exportação da váriavel 'routes'.
