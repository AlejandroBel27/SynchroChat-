/*
 * -------------------------------------
 * script.js (LA MAGIA / EL SISTEMA NERVIOSO)
 * -------------------------------------
 * Este archivo es el "pegamento" de todo.
 * Escucha los clics (Event Listeners), habla con el server (Socket.io),
 * y manipula el HTML (DOM).
 */

// --- 1. Conexión Inicial ---
// ¡Lo primero que hacemos! Abrimos la "línea telefónica" al servidor.
// 'socket' será nuestro teléfono personal para hablar con el anfitrión (server.js).
const socket = io();

// --- 2. Variable Global (Nuestro "Gafete" de ID) ---
// La necesitamos para recordar quiénes somos después de pasar el modal.
// Sí, las variables globales son "meh", pero pa' este proyecto jalan perfecto.
let myUsername = 'UsuarioAnónimo';

// --- 3. Agarrando los Elementos del HTML (El DOM) ---
// Guardamos en variables los elementos del HTML que vamos a manipular,
// para no tener que buscarlos cada vez.

// --- A. Del Modal de Bienvenida ---
const welcomeScreen = document.getElementById('welcome-screen');
const welcomeForm = document.getElementById('welcome-form');
const usernameInput = document.getElementById('username-input'); // El input del modal

// --- B. Del Contenedor del Chat ---
const chatContainer = document.getElementById('chat-container');
const profileUsernameEl = document.getElementById('profile-username'); // El <span> en la sidebar

// --- C. Del Formulario de Mensajes ---
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input'); // El input de mensaje
const chatArea = document.getElementById('chat-area');

// --- D. De la Lista de Usuarios ---
const userListEl = document.getElementById('user-list');
const userTitleEl = document.getElementById('user-list-title');

// --- E. Del Picker de Emojis ---
const emojiButton = document.getElementById('emoji-button');
const emojiPicker = document.querySelector('emoji-picker'); // Se busca por etiqueta

// --- 4. Lógica del Historial Local (RETO ADICIONAL) ---
// Esto es para guardar mensajes aunque cerremos la pestaña.

const HISTORY_KEY = 'synchroChatHistory'; // El nombre de la "caja" en el navegador
const MAX_HISTORY = 5; // Solo guardamos los últimos 5

// Función 1: Cargar historial (se llama al final)
function loadHistory() {
    const history = getHistory();
    // "Pintamos" cada mensaje guardado
    history.forEach(msg => {
        addMessageToChat(msg.user, msg.text, false); // false = no es de sistema
    });
    console.log('Historial de chat cargado.');
}

// Función 2: Obtener historial
function getHistory() {
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    // localStorage guarda solo TEXTO. JSON.parse lo convierte de nuevo en un objeto/array.
    // Si no hay nada (null), regresa un array vacío [].
    return rawHistory ? JSON.parse(rawHistory) : [];
}

// Función 3: Guardar un mensaje
function saveMessageToHistory(user, text) {
    const history = getHistory(); // Leemos lo que hay
    history.push({ user, text }); // Añadimos el nuevo mensaje

    // .slice(-5) es un truco para "cortar" el array y quedarnos solo con los últimos 5.
    const limitedHistory = history.slice(-MAX_HISTORY);

    // JSON.stringify lo convierte en TEXTO para poder guardarlo.
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
}
// ----------------------------------------------------

// --- 5. Detector de Emojis (Pa' la animación) ---
function isEmojiOnly(str) {
    // Esta es una Expresión Regular (Regex) de terror.
    // Básicamente, busca caracteres Unicode en la categoría "Emoji".
    // Si solo encuentra eso, devuelve 'true'.
    const emojiRegex = /^\p{Emoji}+$/u;
    return emojiRegex.test(str.trim());
}

// --- 6. LOS EVENT LISTENERS (La Interacción) ---

// --- A. Evento: "Entrar al Chat" (El Modal) ---
welcomeForm.addEventListener('submit', (e) => {
    // ¡LA LÍNEA MÁS IMPORTANTE DE JS!
    // Evita que el formulario recargue la página (comportamiento por defecto).
    e.preventDefault();

    const username = usernameInput.value;

    // Validamos que no esté vacío
    if (username && username.trim().length > 0) {
        // 1. Guardamos el nombre en nuestro "gafete" global
        myUsername = username;

        // 2. Avisamos al servidor (al "anfitrión") cómo nos llamamos
        socket.emit('user joined', myUsername);

        // 3. Escribimos nuestro nombre en el perfil de la sidebar
        profileUsernameEl.textContent = myUsername;

        // 4. EL TRUCO VISUAL: Ocultamos el modal...
        welcomeScreen.style.display = 'none';

        // 5. ...y mostramos el contenedor del chat.
        // Usamos 'flex' porque así lo definimos en el CSS.
        chatContainer.style.display = 'flex';

        // 6. (Pro-tip) Ponemos el cursor listo en el input de mensaje.
        messageInput.focus();
    }
});

// --- B. Evento: "Enviar un Mensaje" ---
messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); // De nuevo, ¡no recargar!
    const messageText = messageInput.value;

    // Usamos nuestro "gafete" (myUsername) como el autor
    if (messageText) {
        const message = {
            user: myUsername, // <-- Aquí usamos la variable global
            text: messageText
        };

        // 1. Mandamos el paquete (mensaje) al servidor
        socket.emit('chat message', message);

        // 2. Limpiamos nuestro input
        messageInput.value = '';
    }
});

// --- C. Eventos del Picker de Emojis ---

// 1. Clic en el botón 🥳
emojiButton.addEventListener('click', () => {
    // .toggle() es genial: si tiene la clase "visible", se la quita.
    // Si no la tiene, se la pone.
    emojiPicker.classList.toggle('visible');
});

// 2. Clic en un emoji del panel
// (La librería nos da este evento 'emoji-click')
emojiPicker.addEventListener('emoji-click', (event) => {
    // 1. Añadimos el emoji (event.detail.unicode) al texto del input
    messageInput.value += event.detail.unicode;

    // 2. Ocultamos el panel
    emojiPicker.classList.remove('visible');

    // 3. Devolvemos el cursor al input
    messageInput.focus();
});
// ----------------------------------------


// --- 7. LOS OYENTES DEL SOCKET (Escuchando al Servidor) ---
// Aquí es donde reaccionamos a los "gritos" (emits) del anfitrión (server.js).

// --- A. Oyente: "Llegó un mensaje de chat" ---
socket.on('chat message', (msg) => {
    // 'msg' es el objeto { user: 'Juan', text: 'Hola' }
    addMessageToChat(msg.user, msg.text); // Lo "pintamos"

    // (RETO ADICIONAL) Guardamos el mensaje en el historial
    saveMessageToHistory(msg.user, msg.text);
});

// --- B. Oyente: "Llegó un mensaje del sistema" ---
socket.on('system message', (msg) => {
    // 'msg' es solo texto (Ej. "Juan se unió...")
    addMessageToChat('Sistema', msg, true); // true = es de sistema
    // No guardamos los mensajes de sistema en el historial.
});

// --- C. Oyente: "Llegó la lista de usuarios actualizada" ---
socket.on('update user list', (users) => {
    // 'users' es un array ["Juan", "Ana"]

    // 1. "Nukeamos" la lista vieja.
    userListEl.innerHTML = '';

    // 2. "Pintamos" la lista nueva
    users.forEach(user => {
        const li = document.createElement('li'); // Creamos un <li>
        li.textContent = user; // Le ponemos el nombre
        userListEl.appendChild(li); // Lo añadimos a la <ul>
    });

    // 3. (RETO ADICIONAL) Actualizamos el contador
    userTitleEl.textContent = `Conectados (${users.length})`;
});

// --- D. Oyente: "Se cayó el servidor" ---
// (PUNTO EXTRA de robustez)
socket.on('disconnect', () => {
    addMessageToChat('Sistema', 'Se ha perdido la conexión con el servidor. 😢 Intentando reconectar...', true);
});

// --- 8. Función de Ayuda (Helper) ---
// La función "Pintar Mensaje".
// La hicimos para no repetir código (Principio DRY).

function addMessageToChat(user, text, isSystemMessage = false) {
    // 1. Creamos un <div> vacío
    const messageElement = document.createElement('div');

    if (isSystemMessage) {
        messageElement.classList.add('system-message');
        // Usamos textContent porque no necesitamos HTML especial
        messageElement.textContent = `*** ${text} ***`;
    } else {
        // Es un mensaje normal
        messageElement.classList.add('chat-message');

        // Usamos innerHTML para poder meter la etiqueta <strong>
        messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;

        // (PUNTO EXTRA) Si es solo un emoji...
        if (isEmojiOnly(text)) {
            // ...le ponemos la clase pa' que el CSS lo anime.
            messageElement.classList.add('emoji-message');
        }
    }

    // 2. Añadimos el <div> nuevo al área de chat
    chatArea.appendChild(messageElement);

    // 3. (Pro-tip) Scroll automático al fondo
    // Hacemos que la altura del scroll sea igual a la altura total.
    chatArea.scrollTop = chatArea.scrollHeight;
}

// --- 9. EJECUTAR AL INICIO ---
// Cargamos el historial guardado tan pronto como se abre la página.
loadHistory();