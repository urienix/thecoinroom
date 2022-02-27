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
    
    if (!(username === 'urienix')) {
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

function testGetMessage(){
    let message = {
        username: 'urienix',
        avatar: 'kirby',
        color: 'yellow',
        message: 'Hola que pedo'
    }
    let messageBlock = generateMessageBlock(message.username, message.avatar, message.color, message.message);
    document.getElementById('conversationSection').insertAdjacentHTML('beforeend', messageBlock.innerHTML);
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
}

document.getElementById('iniciarConexion').addEventListener('submit', (e) => {
    e.preventDefault();

    let apodo = document.getElementById('apodo');
    let color = document.getElementById('color');
    let avatar = document.getElementById('avatar');
    apodo.classList.remove('is-danger');
    color.classList.remove('is-danger');
    avatar.classList.remove('is-danger');

    if (apodo.value.trim().length < 3) {
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

    socket.on('userExists', () => {
        window.alert('Apodo ya existe');
        sessionStorage.removeItem('user');
        $('#setConfigsModal').modal('show');
    });

    socket.on('userConnected', (data) => {
        console.log(data);
    });
}