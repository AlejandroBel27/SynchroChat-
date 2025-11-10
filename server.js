
// 'express' es como el "mesero". Sirve los archivos (HTML, CSS, JS) al navegador.
const express = require('express');

// 'http' es como si fuera el salón de fiestas. 
const http = require('http');

// 'path' es el "mapa". Nos ayuda a encontrar archivos sin perdernos.
const path = require('path');

// 'Server' (de socket.io) es el "DJ y sistema de sonido". 
const { Server } = require("socket.io");

// --- 2. Montando el "Salón" ---

const app = express(); 
const server = http.createServer(app); 
const io = new Server(server); 

// --- 3. El "Mesero" (Express) sirviendo los archivos ---

// Esta línea le dice a Express: "Oye, si te piden un archivo (como style.css o script.js),
// solo búscalo en la carpeta raíz (__dirname) y sírvelo".
app.use(express.static(path.join(__dirname)));

// Esta es la ruta principal. Cuando alguien entra a "localhost:3000/"
app.get('/', (req, res) => {
    // El mesero le da el archivo 'index.html'.
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 4. La "Lista VIP" (Para rastrear usuarios) ---

// Un objeto simple. La 'key' será el ID del socket, y el 'value' será el nickname.
// Ej. { "Yesus": "alejandro", "Fernando": "Linda" }
const connectedUsers = {};


// --- 5. El núcleo de Socket.io ---


// Este código se ejecuta CADA VEZ que una nueva persona (un navegador) abre la página.
io.on('connection', (socket) => {

   
    console.log(`Un compa se conectó. Su ID de pase: ${socket.id}`);

    
    socket.on('user joined', (username) => {
        // 1. Guardamos su nombre en su "pase" (socket) para futura referencia.
        socket.username = username;
        // 2. Lo añadimos a nuestra "Lista VIP".
        connectedUsers[socket.id] = username;

        console.log(`El compa ${socket.id} se llama ${username}`);

        // 3. Avisamos a TODOS (io.emit) que este compa se unió.
        const joinMessage = `${username} se ha unido al chat. ¡Trajo sus emojis! 😎`;
        io.emit('system message', joinMessage);

        // 4. Mandamos la "Lista VIP" actualizada a TODOS.
        io.emit('update user list', Object.values(connectedUsers));
    });

    // C. Cuando el "invitado" se va (cierra la pestaña)
    socket.on('disconnect', () => {
        console.log(`El compa ${socket.id} se fue.`);

        // Revisamos si este compa tenía nombre
        if (socket.username) {
            // 1. Avisamos a todos que se fue.
            const leaveMessage = `${socket.username} ha salido del chat. Se llevó sus emojis consigo 😢`;
            io.emit('system message', leaveMessage);

            // 2. Lo borramos de la "Lista VIP".
            delete connectedUsers[socket.id];

            // 3. Mandamos la lista actualizada a todos los que quedan.
            io.emit('update user list', Object.values(connectedUsers));
        }
    });

    // D. Cuando el "invitado" manda un mensaje (evento 'chat message')
    socket.on('chat message', (msg) => {

        console.log(`Mensaje de ${msg.user}: ${msg.text}`);

        io.emit('chat message', msg);
    });
});

// --- 6. Abrir las puertas de la fiesta ---

// Ponemos al servidor a escuchar en el puerto 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor SynchroChat escuchando en http://localhost:${PORT}`);
});