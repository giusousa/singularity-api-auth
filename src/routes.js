const express = require('express');
const axios = require('axios') ;

const projectConfig = require('./config/project.json')

const UserController = require('./controllers/UserController');
const StoreController = require('./controllers/StoreController');
const ContactController = require('./controllers/ContactController');
const MessageController = require('./controllers/MessageController');

const AuthController = require('./controllers/AuthController');
const ForgotPassword = require('./controllers/ForgotPassword');
const ResetPassword = require('./controllers/ResetPassword');

const EmailCheck	= require('./controllers/EmailCheck');

const authMiddleware = require('./middlewares/auth');
const permissionMiddleware = require('./middlewares/permission');

const { celebrate, Segments, Joi } = require('celebrate');

const routes  = express.Router();

	// ====================================================
	// ====================================================
	// ROTAS ABERTAS
	// ====================================================
	// ====================================================

	// CONSULTA DE E-MAIL
	routes.post('/email_check/*', celebrate({
		[Segments.BODY]: 	Joi.object().keys({
			email: 			Joi.string().required().email(),
		})
	}), EmailCheck)

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
			managerName:	Joi.string(),
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
			secrets:		Joi.array(),

			attributes:		Joi.object().required()
			

		})

	}), permissionMiddleware, UserController.create); 
	
	routes.get('/user/*', authMiddleware, celebrate({

		[Segments.QUERY]: 	Joi.object().keys({
			page: 			Joi.number(),
			managerName:	Joi.string(),
			cpfCnpj:		Joi.string(),
			telephone1:     Joi.string().min(10).max(13),
			telephone2:     Joi.string().min(10).max(13),
			whatsapp:       Joi.string().min(10).max(13),
			secrets:		Joi.string(),
			attributes:		Joi.string(),
			managerId:		Joi.string(),
			level: 			Joi.string(),
			stores:			Joi.array(),
		}),

	}), permissionMiddleware, UserController.index); 

	routes.put('/user/*', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({

			_id:			Joi.string().required(),
			name:           Joi.string(),
			cpfCnpj:        Joi.string(),
			birth:          Joi.string(),

			managerName: 	Joi.string(),
	
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
			secrets:		Joi.array(),
			
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
			type:			Joi.string(),
			modules:		Joi.array(),
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
			type:			Joi.string(),
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

			modules:		Joi.array(),
		})
	}), permissionMiddleware, StoreController.edit); 

	routes.delete('/store/*', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required(),
		})
	}), permissionMiddleware, StoreController.delete); 


	// CADASTRO DE CONTATOS, EDIÇÃO E DELEÇÃO
	routes.post('/contact/*', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({
			project:			Joi.string(),
			storeId:			Joi.string(),
			userName:			Joi.string().required(),
			group:				Joi.array(),
			status:				Joi.boolean(),
			score:				Joi.number(),
			type:				Joi.string(),
			title:				Joi.string(),
			attributes:			Joi.object(),
		})

	}), ContactController.create); 

	routes.get('/contact/*', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			page: 			Joi.number(),
			_id:			Joi.string(),
			managerId:		Joi.string(),
			storeId:		Joi.string(),
			userId:			Joi.string(),
			status:			Joi.boolean(),
			score:			Joi.number(),
			type:			Joi.string(),
			title:			Joi.string(),
		})
	}), ContactController.index);

	routes.put('/contact/*', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({
			_id:				Joi.string().required(),
			group:				Joi.array(),
			status:				Joi.boolean(),
			score:				Joi.number(),
			type:				Joi.string(),
			title:				Joi.string(),
			attributes:			Joi.object(),
		})
	}), ContactController.edit); 

	routes.delete('/contact/*', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required()
		})
	}), ContactController.delete); 

	// MENSAGENS
	routes.post('/message/*', authMiddleware, celebrate({
		[Segments.BODY]: Joi.object().keys({
			message: 		Joi.string(),
			contactId:		Joi.string(),
		})
	}), MessageController.create); 

	routes.get('/message/*', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			page: 			Joi.number(),
			_id:			Joi.string(),
			userId:			Joi.string(),
			contactId:		Joi.string().required(),
		})
	}), MessageController.index);

	routes.delete('/message/*', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required()
		})
	}), MessageController.delete); 


module.exports = routes;        // Permite a exportação da váriavel 'routes'.