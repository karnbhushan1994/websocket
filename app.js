// Import necessary modules and create an Express application
const express = require('express');
const path = require('path');
const app = express();

// Define the port for the server to listen on, using an environment variable if available, or defaulting to 4000
const PORT = process.env.PORT || 4000;

// Start the Express server and log the port it's running on
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));

// Import the Socket.IO library and attach it to the Express server
const io = require('socket.io')(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a Set to keep track of connected sockets
let socketsConnected = new Set();

// When a new socket connection is established
io.on('connection', onConnected);

function onConnected(socket) {
  // Log that a new socket is connected and store its ID in the Set
  console.log('Socket connected', socket.id);
  socketsConnected.add(socket.id);

  // Emit the total number of connected clients to all connected sockets
  io.emit('clients-total', socketsConnected.size);

  // When the socket disconnects
  socket.on('disconnect', () => {
    // Log that a socket has disconnected and remove its ID from the Set
    console.log('Socket disconnected', socket.id);
    socketsConnected.delete(socket.id);

    // Emit the updated total number of connected clients to all connected sockets
    io.emit('clients-total', socketsConnected.size);
  });

  // Listen for 'message' events from the socket and broadcast the message to all other sockets except itself
  socket.on('message', (data) => {
    socket.broadcast.emit('chat-message', data);
  });

  // Listen for 'feedback' events from the socket and broadcast the feedback to all other sockets except itself
  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data);
  });
}
