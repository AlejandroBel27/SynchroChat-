
// Abrimos la línea telefónica al servidor.
const socket = io();

// La necesitamos para recordar quiénes somos después de pasar el modal.
let myUsername = 'UsuarioAnónimo';

// Guardamos en variables los elementos del HTML que vamos a manipular,
// para no tener que buscarlos cada vez.

const welcomeScreen = document.getElementById('welcome-screen');
const welcomeForm = document.getElementById('welcome-form');
const usernameInput = document.getElementById('username-input');

const chatContainer = document.getElementById('chat-container');
const profileUsernameEl = document.getElementById('profile-username');

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatArea = document.getElementById('chat-area');

const userListEl = document.getElementById('user-list');
const userTitleEl = document.getElementById('user-list-title');

const emojiButton = document.getElementById('emoji-button');
const emojiPicker = document.querySelector('emoji-picker');

// Esto es para guardar mensajes aunque cerremos la pestaña.
const HISTORY_KEY = 'synchroChatHistory';
const MAX_HISTORY = 5;

// Función 1: Cargar historial (se llama al final)
function loadHistory() {
    const history = getHistory();

    history.forEach(msg => {
        addMessageToChat(msg.user, msg.text, false);
    });
    console.log('Historial de chat cargado.');
}

// Función 2: Obtener historial
function getHistory() {
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    // localStorage guarda solo TEXTO. 
    return rawHistory ? JSON.parse(rawHistory) : [];
}

// Función 3: Guardar un mensaje
function saveMessageToHistory(user, text) {
    const history = getHistory();
    history.push({ user, text });

    // .slice(-5) es un truco para "cortar" el array y quedarnos solo con los últimos 5.
    const limitedHistory = history.slice(-MAX_HISTORY);

    // JSON.stringify lo convierte en TEXTO para poder guardarlo.
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
}

// --- 5. Detector de Emojis Pa' la animación
function isEmojiOnly(str) {

    const emojiRegex = /^\p{Emoji}+$/u;
    return emojiRegex.test(str.trim());
}

// --- 6. LOS EVENT LISTENERS (La Interacción) ---

// --- A. Evento: "Entrar al Chat" (El Modal) ---
welcomeForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const username = usernameInput.value;

    // Validamos que no esté vacío
    if (username && username.trim().length > 0) {
        // 1. Guardamos el nombre en nuestro "gafete" global
        myUsername = username;

        // 2. Avisamos al servidor cómo nos llamamos
        socket.emit('user joined', myUsername);

        // 3. Escribimos nuestro nombre en el perfil de la sidebar
        profileUsernameEl.textContent = myUsername;

        // 4. Ocultamos el modal...
        welcomeScreen.style.display = 'none';

        // 5. ...y mostramos el contenedor del chat.

        chatContainer.style.display = 'flex';

        // 6. (Pro-tip) Ponemos el cursor listo en el input de mensaje.
        messageInput.focus();
    }
});

// --- B. Evento: "Enviar un Mensaje" ---
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = messageInput.value;


    if (messageText) {
        const message = {
            user: myUsername,
            text: messageText
        };

        // 1. Mandamos el paquete mensaje al servidor
        socket.emit('chat message', message);

        // 2. Limpiamos nuestro input
        messageInput.value = '';
    }
});

emojiButton.addEventListener('click', () => {

    emojiPicker.classList.toggle('visible');
});


emojiPicker.addEventListener('emoji-click', (event) => {

    messageInput.value += event.detail.unicode;


    emojiPicker.classList.remove('visible');


    messageInput.focus();
});



// --- 7. LOS OYENTES DEL SOCKET ---
// Aquí es donde reaccionamos a los "gritos" (emits) del anfitrión (server.js).

socket.on('chat message', (msg) => {

    addMessageToChat(msg.user, msg.text);

    saveMessageToHistory(msg.user, msg.text);
});

socket.on('system message', (msg) => {

    addMessageToChat('Sistema', msg, true);
});

socket.on('update user list', (users) => {

    userListEl.innerHTML = '';


    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userListEl.appendChild(li);
    });


    userTitleEl.textContent = `Conectados (${users.length})`;
});


socket.on('disconnect', () => {
    addMessageToChat('Sistema', 'Se ha perdido la conexión con el servidor. 😢 Intentando reconectar...', true);
});


function addMessageToChat(user, text, isSystemMessage = false) {

    const messageElement = document.createElement('div');

    if (isSystemMessage) {
        messageElement.classList.add('system-message');

        messageElement.textContent = `*** ${text} ***`;
    } else {

        messageElement.classList.add('chat-message');


        messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;


        if (isEmojiOnly(text)) {

            messageElement.classList.add('emoji-message');
        }
    }


    chatArea.appendChild(messageElement);


    chatArea.scrollTop = chatArea.scrollHeight;
}

// Cargamos el historial guardado tan pronto como se abre la página.
loadHistory();