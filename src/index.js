const app = require('./app');
const server = require('http').Server(app);
let io = require('socket.io')(server);

require('./socketio/socketio.server')(io);

server.listen(app.get('port'), () => {
    console.log('Server sockets is on port', app.get('port'));
});