const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const statusIndicator = document.getElementById('status-indicator');

const ws = new WebSocket('ws://localhost:3000');

window.onload = async () => {
  try {
    const res = await fetch('http://localhost:3000/messages');
    const messages = await res.json();
    messages.forEach(msg => {
      displayMessage(msg.sender, msg.message, msg.sender === 'You' ? 'sent' : 'received');
    });
  } catch (err) {
    console.error('Error loading chat history:', err);
  }
};

function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    ws.send(message);
    displayMessage('You', message, 'sent');
    messageInput.value = '';
  }
}

ws.onmessage = function (event) {
  displayMessage('Friend', event.data, 'received');

  if (document.hidden && Notification.permission === "granted") {
    new Notification("New message", { body: event.data });
  }
};

ws.onopen = () => updateStatus(true);
ws.onclose = () => updateStatus(false);

function displayMessage(sender, message, type) {
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  msg.textContent = `${sender}: ${message}`;
  chatBox.appendChild(msg);
}

function updateStatus(isOnline) {
  statusIndicator.textContent = isOnline ? '🟢 Online' : '🔴 Offline';
  statusIndicator.className = `status ${isOnline ? 'online' : 'offline'}`;
}

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}
