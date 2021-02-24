const SocketIO = require('socket.io')
const authMiddleware = require('../middleware/auth')
const wrap = middleware => (socket, next) => middleware(socket.request, socket, next);
module.exports = {
  /**@type {SocketIO.Server} */
  io: null,
  connect(expressApp) {
    this.io = SocketIO(expressApp, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: false
      }
    })

    this.io.use(wrap(authMiddleware))
    this.io.on('error', function(error) {
      console.log(error)
    })
    this.io.on('connect', (socket) => {
      // @ts-ignore
      if(socket.user) {
        const userId = socket.user._id
        socket.join(userId)
      }
    })
  },
  notifyUsers(user, scope, data) {
    return this.io.to(user._id).emit(scope, {
      scope,
      data
    })
  }
}