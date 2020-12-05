const express = require('express');
const axios = require('axios') ;

const projectConfig = require('./config/project.json')

const UserController = require('./controllers/UserController');
const ProjectController = require('./controllers/ProjectController');
const RouteController = require('./controllers/RouteController');

const AuthController = require('./controllers/AuthController');
const ForgotPassword = require('./controllers/ForgotPassword');
const ResetPassword = require('./controllers/ResetPassword');

const EmailCheck	= require('./controllers/EmailCheck');

const authMiddleware 		= require('./middlewares/auth');
const permissionMiddleware 	= require('./middlewares/permission');
const controllerRouteMiddleware	= require('./middlewares/controllerRoute');
const controllerProjectMiddleware	= require('./middlewares/controllerProject');
const paramsMiddleware		= require('./middlewares/params')

const { celebrate, Segments, Joi } = require('celebrate');

const mongoIndex = require('./mongo/index');
const error = require('./controllers/scripts/error');

const loadRouteMiddleware = require('./middlewares/loadRoute');
const loadProjectMiddleware = require('./middlewares/loadProject');

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
	routes.post('/auth/login', celebrate({
		[Segments.BODY]: 	Joi.object().keys({
			email:  		Joi.string().required(),
			password:  		Joi.string().required(),
			projectId:		Joi.string(),
			managerId: 		Joi.string(),
		})
	}), AuthController.create); 

	routes.get('/auth/login', authMiddleware, AuthController.index); 

	routes.delete('/auth/login', authMiddleware, AuthController.delete); 

	// CADASTRO DE USUÁRIOS
	routes.post('/auth/user', authMiddleware, celebrate({
		[Segments.BODY]: Joi.object().keys({
			name:           Joi.string().required(),
			email:          Joi.string().required().email(),
			password:       Joi.string().required().min(6).max(20),
			level: 			Joi.string().required(),
			attributes:		Joi.object().required(),
			projectId:		Joi.string(),
			managerName:	Joi.string(),
			//secrets:		Joi.array(),
		})
	}), UserController.create); 
	
	routes.get('/auth/user', authMiddleware, celebrate({
		[Segments.QUERY]: 	Joi.object().keys({
			page: 			Joi.number(),
			skip:           Joi.number(),
			createdAt:      Joi.object(),
			updatedAt:      Joi.object(),
			//secrets:		Joi.string(),
		}),
	}), UserController.index); 

	routes.put('/auth/user', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({
			_id:			Joi.string().required(),
			name:           Joi.string(),
			password:       Joi.string().min(6).max(20),
			level: 			Joi.string(),
			attributes:		Joi.object(),
			managerName:	Joi.string(),
			//secrets:		Joi.array(),
		}),
		[Segments.QUERY]: Joi.object().keys({
			editSubKey:		Joi.boolean(),
		}),

	}), UserController.edit); 

	routes.delete('/auth/user', authMiddleware, celebrate({

		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required()
		}),
		
	}), UserController.delete); 

	// CADASTRO DE PROJETOS
	routes.post('/auth/project', authMiddleware, celebrate({
		[Segments.BODY]: Joi.object().keys({
			name:           Joi.string().required(),
			status:			Joi.boolean().required(),
			managerWorkspace:Joi.boolean().required(),
		})
	}), ProjectController.create); 

	routes.get('/auth/project', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			page: 			Joi.number(),
			skip:           Joi.number(),
			createdAt:      Joi.object(),
			updatedAt:      Joi.object(),
			name:			Joi.string(),
			status:			Joi.boolean(),
			statusAdmin:	Joi.boolean(),
		})
	}), ProjectController.index);

	routes.put('/auth/project', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({
			_id:			Joi.string().required(),
			name:           Joi.string(),
			status:			Joi.boolean(),
			statusAdmin:	Joi.boolean(),
		}),
		[Segments.QUERY]: Joi.object().keys({
			editSubKey:		Joi.boolean(),
		}),
	}), ProjectController.edit); 

	routes.delete('/auth/project', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required(),
		})
	}), ProjectController.delete); 

	// CADASTRO DE ROTAS
	routes.post('/auth/route', authMiddleware, celebrate({
		[Segments.BODY]: Joi.object().keys({
			url:           	Joi.string().required(),
			projectId:     	Joi.string().required(),
			methods:		Joi.array().required(),
			policy:			Joi.object().required(),
			preDatabase:	Joi.object(),
			posDatabase:	Joi.object(),
			params:			Joi.object().required(),
			modelDb:		Joi.object(),
			status:			Joi.boolean(),
			redis:			Joi.boolean(),
			socket:			Joi.boolean(),
			socketQueryStart:Joi.object(),
			socketCreatePreQuery:Joi.string(),
			socketCreatePolicy:Joi.string()
		})
	}), RouteController.create); 

	routes.get('/auth/route', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			page: 			Joi.number(),
			skip:           Joi.number(),
			createdAt:      Joi.object(),
			updatedAt:      Joi.object(),

			projectId:     	Joi.string(),
			status:			Joi.boolean(),
		})
	}), RouteController.index);

	routes.put('/auth/route', authMiddleware, celebrate({

		[Segments.BODY]: Joi.object().keys({
			_id:			Joi.string().required(),
			methods:		Joi.array(),
			policy:			Joi.object(),
			preDatabase:	Joi.object(),
			posDatabase:	Joi.object(),
			params:			Joi.object(),
			modelDb:		Joi.object(),
			status:			Joi.boolean(),
			redis:			Joi.boolean(),
			socket:			Joi.boolean(),
			socketQueryStart:Joi.object(),
			socketCreatePreQuery:Joi.string(),
			socketCreatePolicy:Joi.string(),
		}),
		[Segments.QUERY]: Joi.object().keys({
			editSubKey:		Joi.boolean(),
		}),
	}), RouteController.edit); 

	routes.delete('/auth/route', authMiddleware, celebrate({
		[Segments.QUERY]: Joi.object().keys({
			_id:  Joi.string().required(),
		})
	}), RouteController.delete); 

	// ROTAS PERSONALIZADAS LOCAIS
	routes.all('/route/*', authMiddleware, loadRouteMiddleware, paramsMiddleware, controllerRouteMiddleware); 
	// ROTAS PERSONALIZADAS DE PROJETO
	routes.all('/project/*', loadProjectMiddleware, authMiddleware, paramsMiddleware, controllerProjectMiddleware);

	/** catch 404 and forward to error handler */
	routes.all('*', (req, res) => {
		return res.status(404).json({
		success: false,
		message: 'API endpoint doesnt exist'
		})
	});

module.exports = routes;        // Permite a exportação da váriavel 'routes'.