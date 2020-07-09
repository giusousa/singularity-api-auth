const express = require('express');
const axios = require('axios') ;

const projectConfig = require('./config/project.json')

const UserController = require('./controllers/UserController');
const StoreController = require('./controllers/StoreController');
const AuthController = require('./controllers/AuthController');
const ApiControllerIntents = require('./controllers/ApiControllerIntents');
const ForgotPassword = require('./controllers/ForgotPassword');
const ResetPassword = require('./controllers/ResetPassword');

const authMiddleware = require('./middlewares/auth');
const permissionMiddleware = require('./middlewares/permission');
const authApiMiddleware = require('./middlewares/authapi');

const { celebrate, Segments, Joi } = require('celebrate');

const routes  = express.Router();

	// ====================================================
	// ====================================================
	// ROTAS EXCLUSIVA PARA NOSSAS APIS
	// ====================================================
	// ====================================================

	routes.get('/api/*', authApiMiddleware, ApiControllerIntents.router)

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
	
			telephone1:     Joi.string().min(10).max(13),
			telephone2:     Joi.string().min(10).max(13),
			email:          Joi.string().required().email(),
			whatsapp:       Joi.string().min(10).max(13),
	
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

			attributes:		Joi.object().required()

		})

	}), UserController.create); 
	

	routes.get('/user/*', authMiddleware , permissionMiddleware, celebrate({

		[Segments.QUERY]: 	Joi.object().keys({
			page: 			Joi.number(),
		}),

	}), UserController.index); 


	routes.put('/user/*', authMiddleware, permissionMiddleware, celebrate({


		[Segments.BODY]: Joi.object().keys({

			_id:			Joi.string().required(),
			name:           Joi.string(),
			cpfCnpj:        Joi.string(),
			birth:          Joi.string(),
	
			telephone1:     Joi.string().min(10).max(13),
			telephone2:     Joi.string().min(10).max(13),
			email:          Joi.string().email(),
			whatsapp:       Joi.string().min(10).max(13),
	
			address:        Joi.string(),
			addressNumber: Joi.string(),
			addressComplement: Joi.string(),
			addressRef:     Joi.string(),
			district:       Joi.string(),
			city:           Joi.string(),
			uf:             Joi.string().length(2),
			cep:            Joi.string().min(8).max(9),

			password:       Joi.string().min(6).max(20),
			level: 			Joi.string(),					//'admin', 'manager' and 'user'
			stores:			Joi.array(),

			attributes:		Joi.object(),

		})

	}), UserController.edit); 


	routes.delete('/user/*', authMiddleware, permissionMiddleware, celebrate({

		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required()
		}),
		
	}), UserController.delete); 

	// CADASTRO DE LOJAS, EDIÇÃO E DELEÇÃO

	routes.post('/store/*', authMiddleware, permissionMiddleware, celebrate({

		[Segments.QUERY]: Joi.object().keys({
			managerId:  Joi.string(),
		}),


		[Segments.BODY]: Joi.object().keys({

			name:           Joi.string().required(),
			cpfCnpj:        Joi.string(),
	
			telephone1:     Joi.string().min(10).max(13),
			telephone2:     Joi.string().min(10).max(13),
			whatsapp:       Joi.string().min(10).max(13),
	
			address:        Joi.string(),
			addressNumber: Joi.string(),
			addressComplement: Joi.string(),
			addressRef:     Joi.string(),
			district:       Joi.string(),
			city:           Joi.string(),
			uf:             Joi.string().length(2),
			cep:            Joi.string().min(8).max(9),
				
			attributes:		Joi.object().required(),
		})


	}), StoreController.create); 

	routes.get('/store/*', authMiddleware, permissionMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			page: 		Joi.number()
		})
	}), StoreController.index);


	routes.put('/store/*', authMiddleware, permissionMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({
			_id:			Joi.string().required(),
			name:           Joi.string(),
			cpfCnpj:        Joi.string(),
	
			telephone1:     Joi.string().min(10).max(13),
			telephone2:     Joi.string().min(10).max(13),
			whatsapp:       Joi.string().min(10).max(13),
	
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
			_id:  Joi.string().required()
		})
	}), StoreController.delete); 

 
	// Redirecionamento para as APIS de projeto
	projectConfig.map(Project => {
		
		routes.all(`/${Project.name}/*`, authMiddleware, async function (req, res) {

			// Cria chaves no cabeçalho QUERY com as variáveis decodificadas do token
			const { userId, managerId, level, project, stores } = req;

			const params = { params: {}}

			// Caso o usuário tenha informado mais alguma QUERY, adicionar
			for (const prop in req.query) {
				params.params[prop] = req.query[prop]
			}

			params.params.userId 	= userId;
			params.params.managerId = managerId;
			params.params.level 	= level;
			params.params.project 	= project;
			params.params.stores 	= stores;

			// Corpo da requisição (Apenas em POST ou PUT)
			const data = req.body ;

			const url = process.env.NODE_ENV == 'PROD' 
				? Project.url 
				: `http://localhost:${Project.port}/`

			const baseURL = axios.create({ baseURL: url });

			try {
				const newRoute 	= req.params[0]
				const method 	= req.method;

				const resApi = 
					method == 'GET'
					? await baseURL.get(newRoute, params)
					: method == 'POST'
						? await baseURL.post(newRoute, data, params)
						: method == 'PUT'
							? await baseURL.put(newRoute, data, params)
							: method == 'DELETE'
								? await baseURL.delete(newRoute, params)
								: false;
				if (!resApi)
					return res.status(400).send({ error: 'Erro request router api' });

				const status  = resApi.status;
				const dataRes = resApi.data;

				return res.status(status).send(dataRes);

			} catch (err) {


				const status = err.response ? err.response.status : 400
				const dataRes 	 = err.response ? err.response.data : 'Not response secondary Api'

				return res.status(status).send({ error: 'Internal api error - ' + JSON.stringify(dataRes) });

			};
		});
	});


module.exports = routes;        // Permite a exportação da váriavel 'routes'.
