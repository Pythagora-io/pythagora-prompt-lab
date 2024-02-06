const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  messages: [
    {
      text: String,
      role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
      }
    }
  ],
  responses: [
    {
      timestamp: {
        type: Date,
        default: Date.now
      },
      text: String
    }
  ]
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

console.log("Conversation model loaded successfully."); // gpt_pilot_debugging_log

module.exports = Conversation;
