let enlacesExistentes = new Map();
let roomname = 'thecoinroom';

let saveUser = (user) => {
    enlacesExistentes.set(user.apodo, {user});
}

module.exports = function(io) {
    io.on('connection', (socket) => {

        socket.on('disconnect', () => {
            console.log('User disconnected');
            enlacesExistentes.delete(socket.apodo);
            io.to(roomname).emit('userDisconnected', socket.apodo); // broadcast con el usuario desconectado
        });

        socket.on('newUser', (data) => {
            console.log('Usuario', data.apodo, 'conectado');
            socket.apodo = data.apodo; // vinculamos el apodo del usuario al socket
            if (enlacesExistentes.has(data.apodo)) {
                socket.emit('userExists');
                console.log('Usuario', data.apodo, 'ya existe');
            }else{
                saveUser(data);
                socket.join(roomname);
                io.to(roomname).emit('newUser', data);
                let users = [];
                enlacesExistentes.forEach(element => {
                    if(element.user.apodo != socket.apodo) users.push(element.user);
                });
                socket.emit('userConnected', users); // enviamos lista de usuarios conectados
                users = []; // limpiamos el array
            }
        });

        socket.on('sendMessage', (data) => {
            io.to(roomname).emit('newMessage', data);
        });
    });
}