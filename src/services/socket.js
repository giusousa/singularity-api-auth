const axios = require('axios');

const redis = require('redis');
const socketRedis = require('socket.io-redis');
const io = require('socket.io')();

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

const authSocket = require('../middlewares/authSocket');
const {getRedis}=require('./redis');

const {route: schemaRoute}= require('../mongo/index');
// Handling multiple nodes: https://socket.io/docs/using-multiple-nodes/
io.adapter( socketRedis({ host: REDISHOST, port: REDISPORT }));

// Recebe os erros que possam ocorrer no socket
io.of('/').adapter.on('error', (err) => console.log('socket error: ', err));

/** Verifica se o user está autenticado */
io.use(authSocket);

io.on('connection', async (socket) => {

  console.log('connection');

  const { projectId, token } = socket.userData;
  const project = await getRedis(projectId, 'project');
  
  const queryRoute = {socket: true, status: true, projectId}
  const routes = await  schemaRoute.find(queryRoute).lean();

  const api = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: { authorization: `Bearer ${token}`},
  });

  socket.on('start',  async () => {

    console.log('start')
    
    const dataResponse = {};

    await Promise.all(routes.map(async route => {
      const { url, socketQueryStart = {}, policy } = route

      const policyTest = !policy || !policy.get || policy.get.includes(socket.userData.level);
      
      if (!policyTest)
        return

      try {
        const items = await api.get('route/'+url, {params: socketQueryStart});

        await items.data.map(({_id}) => {
          socket.join(String(_id));
        });
  
        dataResponse[url] = items.data
        
      } catch (err) {
        console.log(err.response ? err.response.data : err);
      }
  
    }));

    try {
      const userData = await api.get('auth/user');
      await userData.data.map(({_id}) => {
        socket.join(String(_id));
      });
      dataResponse.user = userData.data
    } catch (err) {
      console.log(err.response ? err.response.data : err)
    }

    socket.emit('start', dataResponse);
  });

});

const Socket = 
{ 
  emitPostUser: async (data) => {
    data.url = 'user'
    const policy = {
      client: ['manager', 'superuser', 'user'],
      user:   ['manager', 'superuser'],
      superuser:['manager']
    };

    const project = await getRedis(data.projectId, 'project');
    for (const [_, socket] of io.of("/").sockets) {
      // dados codificados no token de autenticação
      const {token, projectId, managerId, level } = socket.userData;

      const case1 = !project.managerWorkspace && projectId === data.projectId;
      const case2 = project.managerWorkspace  && projectId === data.projectId && managerId === data.managerId;

      const policyTest = policy[data.level].includes(level)

      if (policyTest && (case1 || case2)) {
        socket.join(String(data._id));
        // verifica os usuarios online que devem receber uma atualização contento
        // este novo arquivo criada
        socket.emit('create', data);
      }
    };
  },
  // Emite uma atualização aos dispositivos que devem ouvir a informação CRIADA
  emitPOST: async (data) => {

    const queryRoom = async (room) => {
      // all sockets in the "chat" namespace and in the "general" room
      const ids = await io.of("/").in(room).allSockets();
      return ids;
    }
    const querySocket = (socketId) => {
      // get a socket by ID in the main namespace
      const socket = io.of("/").sockets.get(socketId);
      return socket;
    };

    if (!data.url)
      return console.log('Param (url e projectId) required in socket') 

    const project = await getRedis(data.projectId, 'project');
    const route   = await getRedis(data.projectId + '/' + data.url, 'route');

    
    if(!route.socket)
      return console.log('Socket disabled in the route')

    if (route.socketCreatePreQuery) {
      const response = await eval(route.socketCreatePreQuery)()
      if(response === false) return
    }
      
    for (const [_, socket] of io.of("/").sockets) {

      // dados codificados no token de autenticação
      const {token, projectId, managerId, level } = socket.userData;

      const policyTest = !route.policy || !route.policy.get || route.policy.get.includes(level);

      const case1 = !project.managerWorkspace &&  projectId === data.projectId;
      const case2 = project.managerWorkspace  &&  projectId === data.projectId && managerId === data.managerId;
      
      if ( policyTest && (case1 || case2)) {
        
        if (route.socketCreatePolicy && route.socketCreatePolicy.trim().length > 0) {
          try {
            const socketCreatePolicy = eval(route.socketCreatePolicy)()
            if (!socketCreatePolicy) return 
          } catch (err) {
            console.log(`Erro function socketCreatePolicy - Route: ${route.url} || err: `, err)
          }
        } 


        // inclui o socket na sala que armazenará os clientes que devem "ouvir"
        // atualizações neste objeto que foi criado.

        socket.join(String(data._id));
        // verifica os usuarios online que devem receber uma atualização contento
        // este novo arquivo criada
        socket.emit('create', data);
     
      }
    };

  },
  // Emite uma atualização aos dispositivos conectados a aquela informação EDITADA
  emitPUT: async (data) => { 
    if (!data.url)
      return console.log('Param url required in socket') 

    io.to(String(data._id)).emit('update', data);
  },

  emitDELETE: (data) => {
    if (!data.url)
      return console.log('Param url required in socket') 

    io.to(String(data._id)).emit('delete', data);
  },
}

exports.Socket = Socket;
exports.io = io;