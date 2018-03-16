var io = require('socket.io')({
  // origins: '*'
  path: '/io',
})

const sessions = {}

io.on('connection', function(socket) {
  socket.on('offer', function (id, data) {
    _.set(sessions, `${id}.offer`, data)
  })

  socket.on('answer', function (data) {
    socket.broadcast.emit('answer', data)
  })

  socket.on('getOffer', function (id) {
    socket.emit('getOffer', _.get(sessions, `${id}.offer`))
  })

  socket.on('disconnect', function () {
    socket.broadcast.emit('disconnect')
  })
})

io.listen(4000)
