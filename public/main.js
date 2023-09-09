// Connect to the Socket.IO server
const socket = io();

// Get references to various HTML elements
const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Load an audio tone for new messages
const messageTone = new Audio('/message-tone.mp3');

// Add an event listener for the message form submission
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Listen for 'clients-total' event to update the total number of clients
socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

// Function to send a message to the server
function sendMessage() {
  if (messageInput.value === '') return;
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit('message', data);
  addMessageToUI(true, data);
  messageInput.value = '';
}

// Listen for 'chat-message' event to receive and display new messages
socket.on('chat-message', (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

// Function to add a message to the user interface
function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>
  `;
  messageContainer.innerHTML += element;
  scrollToBottom();
}

// Function to scroll to the bottom of the message container
function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Add event listeners for typing feedback
messageInput.addEventListener('focus', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener('blur', (e) => {
  socket.emit('feedback', {
    feedback: '',
  });
});

// Listen for 'feedback' event to display typing feedback
socket.on('feedback', (data) => {
  clearFeedback();
  const element = `
    <li class="message-feedback">
      <p class="feedback" id="feedback">${data.feedback}</p>
    </li>
  `;
  messageContainer.innerHTML += element;
});

// Function to clear typing feedback messages
function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
