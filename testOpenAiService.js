require('dotenv').config();
const { callOpenAiApi } = require('./openAiService');
const { Server } = require('socket.io');
const http = require('http');

// Create a mock server and socket io instance for testing
const server = http.createServer();
const io = new Server(server);

// Mock Socket.io emit to log events to the console
io.emit = (eventName, data) => {
  console.log(`Event: ${eventName}`, data);
};

const mockMessages = [
  { text: 'Hello, who are you?', sender: 'user' },
  { text: 'I am an AI created by OpenAI.', sender: 'assistant' }
];

// Mock request ID
const requestId = 1;

// Call the function with mock data
callOpenAiApi(mockMessages, io, requestId)
  .then(() => console.log('Test completed'))
  .catch(error => console.error('Test failed:', error));