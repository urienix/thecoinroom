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
        });

        socket.on('newUser', (data) => {
            console.log('Usuario', data.apodo, 'conectado');
            socket.apodo = data.apodo;
            if (enlacesExistentes.has(data.apodo)) {
                socket.emit('userExists');
                console.log('Usuario', data.apodo, 'ya existe');
            }else{
                saveUser(data);
                socket.join(roomname);
                io.to(roomname).emit('userConnected', data);
                let users = [];
                enlacesExistentes.forEach((value, key) => {
                    if(value.user.apodo != socket.apodo) users.push(value.user);
                });
                socket.emit('userConnected', users);
            }
        });
    });
}