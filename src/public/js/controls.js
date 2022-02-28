let colors = {
    blue: 'is-primary',
    green: 'is-success',
    yellow: 'is-warning',
    red: 'is-error',
    gray: 'is-disabled'
}

let avatars = {
    mario: 'nes-mario',
    ash: 'nes-ash',
    pokeball: 'nes-pokeball',
    bulbasaur: 'nes-bulbasaur',
    charmander: 'nes-charmander',
    squirtle: 'nes-squirtle',
    kirby: 'nes-kirby'
};

function generateMessageBlock(username, avatar, color, message) {
    let contentString = '';
    
    if (!(username === JSON.parse(sessionStorage.getItem('user')).apodo)) {
        //from left
        contentString = `
            <section class="message -left">
                <i class="${avatars[avatar]} scalled"></i>
                <div class="nes-balloon from-left is-dark">
                    <p class="nes-text ${colors[color]}">${username}</p>
                    <p>${message}</p>
                </div>
            </section>
        `;
    }else{
        //from right
        contentString = `
            <section class="message -right">
                <div class="nes-balloon from-right with-witle is-dark">
                    <p class="nes-text ${colors[color]}">${username}</p>
                    <p>${message}</p>
                </div>
                <i class="${avatars[avatar]} scalled"></i>
            </section>
        `;
    }
    let parser = new DOMParser();
    let component = parser.parseFromString(contentString, 'text/html');
    return component.documentElement;
}

function sendMessage() {
    let message = document.getElementById('writeMessageInput').value;
    console.log(message);
}

document.getElementById('writeMessageInput').addEventListener('keyup', function(event) {
    if (event.target.value === '') {
        document.getElementById('sendMessageButton').classList.replace('is-primary', 'is-disabled');
        document.getElementById('sendMessageButton').disabled = true;
    }else{
        document.getElementById('sendMessageButton').classList.replace('is-disabled', 'is-primary');
        document.getElementById('sendMessageButton').disabled = false;
    }
});

document.getElementById('sendMessageButton').addEventListener('click', sendMessage);


window.onload = () => {
    if (!sessionStorage.user) {
        $('#setConfigsModal').modal('show');
    }else{
        conectar();
    }
    document.getElementById('writeMessageInput').value = '';
}

document.getElementById('iniciarConexion').addEventListener('submit', (e) => {
    e.preventDefault();

    let apodo = document.getElementById('apodo');
    let color = document.getElementById('color');
    let avatar = document.getElementById('avatar');
    apodo.classList.remove('is-danger');
    color.classList.remove('is-danger');
    avatar.classList.remove('is-danger');

    if (apodo.value.trim().length <= 3) {
        document.getElementById('apodo').classList.add('is-danger');
        return;
    }

    if (color.value === '') {
        document.getElementById('color').classList.add('is-danger');
        return;
    }

    if (avatar.value === '') {
        document.getElementById('avatar').classList.add('is-danger');
        return;        
    }

    let usuario = {
        apodo: document.getElementById('apodo').value,
        avatar: document.getElementById('avatar').value,
        color: document.getElementById('color').value
    }

    sessionStorage.setItem('user', JSON.stringify(usuario));
    conectar();
    $('#setConfigsModal').modal('hide');
});

// socket declarado vacio
let socket = {};

let usersList = new Map();

function conectar() {
    let user = JSON.parse(sessionStorage.getItem('user'));
    socket = io();

    socket.on('connect', () => {
        console.log('Conectando al servidor');
        socket.emit('newUser', user);
    });

    socket.on('userExists', () => { // se emite cuando el apodo ya esta en uso
        window.alert('Apodo ya existe');
        sessionStorage.removeItem('user');
        $('#setConfigsModal').modal('show');
    });

    socket.on('userConnected', (data) => { // se emite cuando un usuario se conecta y devuelve todos los usuarios conectados
        console.log(data);
        data.forEach(user => {
            usersList.set(user.apodo, {user});
        });
        drawUsersList();
    });

    socket.on('newUser', (data) => { // se emite cuando un usuario se conecta y devuelve el nuevo usuario conectado
        usersList.set(data.apodo, {user: data});
        drawUsersList();
    });

    socket.on('userDisconnected', (apodo) => { // se emite cuando un usuario se desconecta y devuelve el usuario desconectado
        usersList.delete(apodo);
        drawUsersList();
    });

    socket.on('newMessage', (data) => { // se emite cuando un usuario envia un mensaje y devuelve el mensaje
        console.log(data);
        console.log(usersList);
        let messageBlock = generateMessageBlock(data.apodo, usersList.get(data.apodo).user.avatar, usersList.get(data.apodo).user.color, data.message);
        document.getElementById('conversationSection').insertAdjacentHTML('beforeend', messageBlock.innerHTML);

        document.getElementById('conversationSection').scrollTop = document.getElementById('conversationSection').scrollHeight;  // hace scroll al final de la conversacion
    });
}


function sendMessage() {
    let message = document.getElementById('writeMessageInput');
    if (message.value.trim().length > 0) {
        socket.emit('sendMessage', {
            apodo: JSON.parse(sessionStorage.getItem('user')).apodo,
            message: message.value
        });
    }
    message.value = '';
    document.getElementById('sendMessageButton').classList.replace('is-primary', 'is-disabled');
    document.getElementById('sendMessageButton').disabled = true;
}

document.getElementById('sendMessageButton').addEventListener('click', sendMessage);

document.getElementById('writeMessageInput').addEventListener('keyup', function(event) {
    if(event.keyCode === 13){
        event.target.value = event.target.value.replace(/\n/g, '').trim();
        sendMessage();
    }
});


function drawUsersList() {
    let contentString = ``;
    let me = JSON.parse(sessionStorage.getItem('user'));
    contentString += `<li class="my-4"><i class="${avatars[me.avatar]} scalled"></i><br><span class="nes-text ${colors[me.color]}">${me.apodo}(tu)</span></li>`;
    if(usersList.size > 1){
        usersList.forEach(item => {
            console.log(item);
            if (item.user.apodo != JSON.parse(sessionStorage.getItem('user')).apodo) {
                contentString += `<li class="my-4"><i class="${avatars[item.user.avatar]} scalled"></i><br><span class="nes-text ${colors[item.user.color]}">${item.user.apodo}</span></li>`;
            }
        });
    }
    document.getElementById('usersConnectedList').innerHTML = contentString;
    document.getElementById('usersConnectedsCount').innerHTML = usersList.size;
}