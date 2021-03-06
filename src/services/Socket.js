import io from 'socket.io-client'

export default {
  /** @property {io.Socket} socket */
  socket: io.io(),
  connect(token) {
    this.socket = io.io(`${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}`, {
      transports: ['polling', 'websocket'],
      secure: true,
      rejectUnauthorized: false,
      transportOptions: {
        polling: {
          extraHeaders: {
            token,
          }
        }
      }
    })
    this.socket.on('connect', function () {
      console.log('Socket connected')
    })
  }
}