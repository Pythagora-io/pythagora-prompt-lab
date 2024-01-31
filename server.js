require('dotenv').config();
const express = require('express');
const path = require('path');
const { callOpenAiApi } = require('./openAiService');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');
const Conversation = require('./models/conversation');

connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.stack);
  process.exit(1);
});

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A client connected: ' + socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
  });
});

app.post('/submit', async (req, res) => {
  const { messages, apiRequestsCount } = req.body;
  console.log(`Submission received with ${apiRequestsCount} requests.`);

  if (!Array.isArray(messages) || typeof apiRequestsCount !== 'number' || apiRequestsCount < 0 || apiRequestsCount > 100) {
    console.error('Invalid input data or the number of API requests is out of bounds');
    return res.status(400).json({ error: 'Invalid input data or the number of API requests is out of bounds' });
  }

  const promises = [];

  for (let i = 0; i < apiRequestsCount; i++) {
    promises.push(callOpenAiApi(messages, io, i + 1));
  }

  res.status(202).send('Accepted');

  try {
    await Promise.all(promises);
    console.log(`All ${apiRequestsCount} API calls have been processed`);
  } catch (error) {
    console.error(`Error during parallel API requests:`, error.message, error.stack);
    io.emit('openai_error', { error: error.message, stack: error.stack });
  }
});

app.post('/api/save-conversation', async (req, res) => {
  try {
    const { name, messages, responses } = req.body;
    if (typeof name !== 'string' || !Array.isArray(messages)) {
      console.error('Invalid conversation data format', { name, messages, responses });
      return res.status(400).send('Invalid conversation data format.');
    }
    if (!Array.isArray(responses) || responses.some(response => !response.text || typeof response.requestNumber !== 'number')) {
      console.error('Invalid responses format', { name, messages, responses });
      return res.status(400).send('Invalid responses data format.');
    }

    const newConversation = new Conversation({
      name,
      messages,
      responses
    });

    await newConversation.save();
    console.log('Conversation saved:', newConversation.name);

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Failed to save conversation:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to save conversation', errorDetails: error.message, stack: error.stack });
  }
});

app.get('/api/load-conversations', async (req, res) => {
  try {
    console.log('Loading conversation list.');
    const conversations = await Conversation.find({}, 'name _id');
    console.log('Conversations loaded:', conversations);

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Failed to load conversations:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to load conversations', errorDetails: error.message, stack: error.stack });
  }
});

app.get('/api/load-conversations/:id', async (req, res) => {
  try {
    console.log(`Loading conversation with ID: ${req.params.id}`);
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      console.log('Conversation not found with ID:', req.params.id);
      return res.status(404).send('Conversation not found.');
    }
    console.log(`Conversation loaded: ${conversation.name}`);
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Failed to load conversation:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to load conversation', errorDetails: error.message, stack: error.stack });
  }
});

app.delete('/api/delete-response/:conversationId/:responseId', async (req, res) => {
  const { conversationId, responseId } = req.params;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log(`Conversation not found with ID: ${conversationId}`);
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const responseIndex = conversation.responses.findIndex(response => response._id.toString() === responseId);
    if (responseIndex === -1) {
      console.log(`Response not found with ID: ${responseId}`);
      return res.status(404).json({ message: 'Response not found.' });
    }

    conversation.responses.splice(responseIndex, 1);
    await conversation.save();
    console.log(`Response with ID: ${responseId} deleted successfully.`);
    res.status(200).json({ message: 'Response deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting response with ID: ${responseId}:`, error.message, error.stack);
    res.status(500).json({ message: 'An error occurred while deleting the response.', error: error.message });
  }
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} with WebSocket support`);
});