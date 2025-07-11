const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/realtime-chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/messages', async (req, res) => {
  const messages = await Message.find({});
  res.json(messages);
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const newMsg = new Message({ sender: 'User', message });
    await newMsg.save();

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
