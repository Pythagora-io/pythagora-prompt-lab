const axios = require('axios');

const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Exponential backoff configuration
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_DELAY = 1000;
const BACKOFF_MULTIPLIER = 2;

// Utility function to format messages for OpenAI API
const formatMessagesForOpenAi = (messages) => {
  return messages.map(message => ({
    role: message.role === 'assistant' ? 'system' : 'user',
    content: message.text.trim(),
  }));
};

const callOpenAiApi = async (messages, io, requestId) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not set.');
  }

  const OPENAI_COMPLETIONS_ENDPOINT = `${OPENAI_API_BASE_URL}/chat/completions`;

  // Using the new utility function to format messages
  const messagesPayload = formatMessagesForOpenAi(messages);

  let attempt = 0;
  let backoffDelay = INITIAL_BACKOFF_DELAY;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.post(
        OPENAI_COMPLETIONS_ENDPOINT,
        {
          model: 'gpt-3.5-turbo',
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
      console.log(`Success with request ID: ${requestId}, response:`, responseData); // Debug log for response data
      io.emit('openai_real_response', { response: responseData, requestId: requestId });
      return;
    } catch (error) {
      // Debug log for error
      console.error(`Error with request ID: ${requestId}, error message:`, error.message, 'error response:', error.response?.data);
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