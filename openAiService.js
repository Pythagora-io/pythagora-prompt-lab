const axios = require('axios');

const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL;

// Exponential backoff configuration
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_DELAY = 1000;
const BACKOFF_MULTIPLIER = 2;

// Utility function to format messages for OpenAI API
const formatMessagesForOpenAi = (messages) => {
  // Enhanced function to handle 'system' messages correctly
  return messages.map(message => {
    switch (message.role) {
      case 'system':
        console.log('Processing system message:', message.text); // gpt_pilot_debugging_log
        // Though OpenAI's API may not directly use 'system' roles, this prepares them for potential logging or debugging
        return { role: 'system', content: message.text.trim() }; 
      case 'assistant':
        console.log('Formatting message as assistant role:', message.text); // gpt_pilot_debugging_log
        return { role: 'system', content: message.text.trim() }; // Treating 'assistant' as 'system' for OpenAI
      case 'user':
        console.log('Formatting message as user role:', message.text); // gpt_pilot_debugging_log
        return { role: 'user', content: message.text.trim() };
      default:
        console.error('Encountered unknown role type:', message.role); // gpt_pilot_debugging_log
        throw new Error(`Unknown role type: ${message.role}`);
    }
  });
};

const callOpenAiApi = async (messages, io, requestId) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not set.');
    throw new Error('OpenAI API key is not set.');
  }

  const OPENAI_COMPLETIONS_ENDPOINT = `${OPENAI_API_BASE_URL}/chat/completions`;

  // Using the updated utility function to format messages
  const messagesPayload = formatMessagesForOpenAi(messages);

  let attempt = 0;
  let backoffDelay = INITIAL_BACKOFF_DELAY;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.post(
        OPENAI_COMPLETIONS_ENDPOINT,
        {
          model: LLM_MODEL,
          messages: messagesPayload,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData = response.data;
      console.log(`Success with request ID: ${requestId}, response:`, responseData); // Debug log for response data. gpt_pilot_debugging_log
      io.emit('openai_real_response', { response: responseData, requestId: requestId });
      return;
    } catch (error) {
      console.error(`Error with request ID: ${requestId}, error message:`, error.message, 'error response:', error.response?.data, error.stack); // Logging the full error details. gpt_pilot_debugging_log
      if (error.response?.status === 429 && attempt < MAX_RETRIES) {
        // Rate limit error, wait before retrying
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        backoffDelay *= BACKOFF_MULTIPLIER;
        attempt++;
      } else {
        // Other type of error or max retries exceeded
        const errorData = {
          message: error.response?.data?.error?.message ?? "Unknown error occurred",
          status: error.response?.status ?? 500,
          requestId: requestId,
        };
        io.emit('openai_error', errorData);
        return;
      }
    }
  }
};

module.exports = { callOpenAiApi };
