require('dotenv').config();
const express = require('express');
const path = require('path');
const { callOpenAiApi } = require('./openAiService');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');
const Conversation = require('./models/conversation');
const mongoose = require('mongoose'); // Ensure mongoose is required

connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.stack);
  process.exit(1);
});

const app = express();

// CORS Middleware to allow different HTTP methods
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

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
  const responses = []; 

  for (let i = 0; i < apiRequestsCount; i++) {
    console.log(`Initiating OpenAI API call #${i + 1}`); // gpt_pilot_debugging_log
    promises.push(callOpenAiApi(messages, io, i + 1));
  }

  res.status(202).send('Accepted');

  try {
    await Promise.all(promises);
    console.log(`All ${apiRequestsCount} API calls have been processed`);

    const newConversation = new Conversation({
      name: `Conversation_${new Date().toISOString()}`,
      messages,
      responses 
    });

    await newConversation.save();
    console.log('Conversation saved:', newConversation._id);
  } catch (error) {
    console.error(`Error during parallel API requests:`, error.message, error.stack); // gpt_pilot_debugging_log
    io.emit('openai_error', { error: error.message, stack: error.stack });
  }
});

app.post('/api/save-conversation', async (req, res) => {
  try {
    const { name, messages, responses } = req.body;
    if (typeof name !== 'string' || !Array.isArray(messages)) {
      console.error('Invalid conversation data format', { name, messages, responses }); // gpt_pilot_debugging_log
      return res.status(400).send('Invalid conversation data format.');
    }
    if (!Array.isArray(responses) || responses.some(response => !response.text || typeof response.requestNumber !== 'number')) {
      console.error('Invalid responses format', { name, messages, responses }); // gpt_pilot_debugging_log
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
    console.error('Failed to save conversation:', error.message, error.stack); // gpt_pilot_debugging_log
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
    console.error('Failed to load conversations:', error.message, error.stack); // gpt_pilot_debugging_log
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
  // Extract parameters and log them
  const { conversationId, responseId } = req.params;
  console.log(`Processing DELETE request for conversation ID: ${conversationId} and response ID: ${responseId}.`); // gpt_pilot_debugging_log

  if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(responseId)) {
    console.error('Invalid ID format for MongoDB ObjectId', { conversationId, responseId }); // gpt_pilot_debugging_log
    return res.status(400).json({ message: 'Invalid ID format for MongoDB ObjectId.' });
  }
  
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.error(`Conversation not found with ID: ${conversationId}`); // gpt_pilot_debugging_log
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const responseIndex = conversation.responses.findIndex(response => response._id.toString() === responseId);
    if (responseIndex === -1) {
      console.error(`Response not found with ID: ${responseId} in conversation: ${conversation.name}`); // gpt_pilot_debugging_log
      return res.status(404).json({ message: 'Response not found.' });
    }

    conversation.responses.splice(responseIndex, 1);
    await conversation.save();

    console.log(`Response with ID: ${responseId} has been successfully deleted from conversation: ${conversationId}.`); // gpt_pilot_debugging_log
    res.status(200).json({ message: 'Response deleted successfully.' });
  } catch (error) {
    console.error('Error occurred:', error.message, error.stack); // gpt_pilot_debugging_log
    res.status(500).json({ error: 'An error occurred while deleting the response.', details: error.message, stack: error.stack });
  }
});

app.delete('/api/delete-conversation/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  console.log(`Processing DELETE request for conversation ID: ${conversationId}.`); // gpt_pilot_debugging_log

  if (!conversationId) {
    console.log(`Conversation ID not provided for deletion.`);
    return res.status(400).json({ message: 'Conversation ID is required.' });
  }

  try {
    const deletedConversation = await Conversation.findOneAndDelete({ _id: conversationId });
    if (!deletedConversation) {
      console.log(`Failed to find and delete conversation with ID: ${conversationId}`);
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    console.log(`Conversation with ID: ${conversationId} has been successfully deleted.`);
    res.status(200).json({ message: `Successfully deleted conversation with ID: ${conversationId}.` });
  } catch (error) {
    console.error('Error occurred:', error.message, error.stack); // gpt_pilot_debugging_log
    res.status(500).json({ error: 'An error occurred while deleting the conversation.', details: error.message, stack: error.stack });
  }
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} with WebSocket support`);
});