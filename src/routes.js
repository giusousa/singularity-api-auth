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
		[Segments.BODY]: 	Joi.object().keys({
			email:  		Joi.string().required(),
			password:  		Joi.string().required(),
			managerId: 		Joi.string(),
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
	routes.post('/user/*', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({

			name:           Joi.string().required(),
			managerId:		Joi.string(),
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

	}), permissionMiddleware, UserController.create); 
	
	routes.get('/user/*', authMiddleware, celebrate({

		[Segments.QUERY]: 	Joi.object().keys({
			page: 			Joi.number(),
			cpfCnpj:		Joi.string(),
			telephone1:     Joi.string().min(10).max(13),
			telephone2:     Joi.string().min(10).max(13),
			whatsapp:       Joi.string().min(10).max(13),
		}),

	}), permissionMiddleware, UserController.index); 

	routes.put('/user/*', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({

			_id:			Joi.string().required(),
			name:           Joi.string(),
			cpfCnpj:        Joi.string(),
			birth:          Joi.string(),
	
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

			password:       Joi.string().min(6).max(20),
			level: 			Joi.string(),					//'admin', 'manager' and 'user'
			stores:			Joi.array(),

			attributes:		Joi.object(),

		})

	}), permissionMiddleware, UserController.edit); 

	routes.delete('/user/*', authMiddleware, celebrate({

		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required()
		}),
		
	}), permissionMiddleware, UserController.delete); 


	// CADASTRO DE LOJAS, EDIÇÃO E DELEÇÃO
	routes.post('/store/*', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({

			name:           Joi.string().required(),
			managerId:		Joi.string(),
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


	}), permissionMiddleware, StoreController.create); 

	routes.get('/store/*', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			page: 			Joi.number(),
			_id:			Joi.string(),
			cpfCnpj:		Joi.string(),
			telephone1:     Joi.string().min(10).max(13),
			telephone2:     Joi.string().min(10).max(13),
			whatsapp:       Joi.string().min(10).max(13),
			attributes:		Joi.object()
		})
	}), permissionMiddleware, StoreController.index);

	routes.put('/store/*', authMiddleware, celebrate({

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
	}), permissionMiddleware, StoreController.edit); 

	routes.delete('/store/*', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required()
		})
	}), permissionMiddleware, StoreController.delete); 

 
module.exports = routes;        // Permite a exportação da váriavel 'routes'.
