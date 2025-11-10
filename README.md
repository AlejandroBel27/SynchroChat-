# SynchroChat 🚀

**Proyecto de Sistemas Distribuidos**

Este es un prototipo de chat en tiempo real creado con Node.js y WebSockets (`socket.io`). La idea era construir un chat funcional,le dimos un *plus* con una interfaz inspirada en Discord.

## ✨ Características

Este proyecto va más allá de un chat básico. Incluye:

* **Servidor WebSocket (Backend):** Hecho en **Node.js** + **Express** + **Socket.io**. Se encarga de recibir conexiones, gestionar usuarios y retransmitir los mensajes a todos.
* **Interfaz tipo Discord:** Un diseño oscuro, de dos columnas (sidebar de usuarios y chat principal), hecho con HTML y CSS (Flexbox).
* **Pantalla de Nickname:** Antes de entrar al chat, una pantalla de bienvenida te pide un nombre de usuario.
* **Selector de Emojis:** Un botón 🥳 que abre un panel completo (`emoji-picker-element`) para insertar emojis fácilmente.
* **Animación de Emojis:** Los mensajes que son *solo* un emoji tienen una animación CSS de "brinco" y se ven más grandes.
* **Lista de Usuarios y Contador:** La sidebar muestra en tiempo real quién está conectado y cuántos son (`Conectados (X)`).
* **Mensajes del Sistema:** El chat te avisa automáticamente cuando alguien entra (`...se ha unido al chat 😎`) o se va (`...ha salido del chat 😢`).
* **Diseño Responsivo:** Se ve decente en celulares. La sidebar se va para arriba y el chat ocupa el resto de la pantalla.
* **Historial Local:** Los últimos 5 mensajes se guardan en el `localStorage` de tu navegador. Si recargas la página, ¡ahí siguen!
* **Manejo de Desconexión:** Si se cae el servidor, aparece un mensaje de error en el chat.

## 🛠️ Cómo ejecutar el proyecto

Para echar a andar este monstruo, solo necesitas [Node.js](https://nodejs.org/) instalado en tu compu.

### 1. Clona o Descarga los Archivos
Asegúrate de tener los 4 archivos en una misma carpeta:
* `server.js`
* `index.html`
* `style.css`
* `script.js`

### 2. Instala las Dependencias
Abre tu terminal **en esa carpeta** y ejecuta este comando.

```bash
npm install express socket.io
```

Esto descargará `express` y `socket.io` en una carpeta `node_modules`.

### 3. Inicia el Servidor

En la misma terminal, corre el servidor:

```bash
node server.js
```
**Si todo sale bien**, deberías ver este mensaje: Servidor SynchroChat escuchando en http://localhost:3000


### 4. ¡A Chatear!
Abre tu navegador web (Chrome, Firefox, etc.).

Ve a la dirección: http://localhost:3000

Pon tu nickname en el modal y dale "Entrar".

¡Abre una segunda pestaña (o una ventana de incógnito) en la misma dirección, pon otro nombre, y ¡chatea contigo mismo! Es la mejor forma de probar que funciona en tiempo real.