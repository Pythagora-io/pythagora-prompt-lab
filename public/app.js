// Remove message item function moved to global scope
function removeMessageItem(element) {
  try {
    const messageItem = element.closest('div');
    messageItem.remove();
    console.log('Message item removed successfully');
  } catch (error) {
    console.error('Failed to remove message item:', error.message, error.stack);
  }
}

// Updated to handle DELETE request with the correct conversationId and responseId
function deleteResponse(event, conversationId, responseId) {
  event.preventDefault();
  console.log(`Initiating DELETE request to URL: /api/delete-response/${conversationId}/${responseId}.`, { conversationId, responseId }); // gpt_pilot_debugging_log

  fetch(`/api/delete-response/${conversationId}/${responseId}`, {
    method: 'DELETE'
  })
  .then(response => {
    console.log(`Deletion API response status for Conversation ID: ${conversationId}, Response ID: ${responseId}: ${response.status}`); // gpt_pilot_debugging_log
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseElement = document.getElementById(`response-${responseId}`);
    if (responseElement) {
      responseElement.remove();
      console.log(`Response #${responseId} deleted successfully from the DOM.`); // gpt_pilot_debugging_log
    } else {
      console.error(`Could not find response element #${responseId} in the DOM to remove.`); // gpt_pilot_debugging_log
    }
  })
  .catch(error => {
    console.error('Failed to delete response:', error.message, error.stack, { conversationId, responseId }); // gpt_pilot_debugging_log
    alert(`Failed to delete response: ${error.message}`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Add event listener for the SUBMIT button
  const submitButton = document.getElementById('submitButton');
  if (submitButton) {
    submitButton.addEventListener('click', submitConversation);
  } else {
    console.error('Submit button not found');
  }

  // Refactor for event delegation for delete response
  const responseContainer = document.getElementById('responseContainer');

  if (responseContainer) {
      responseContainer.addEventListener('click', function(event) {
          if (event.target.matches('.delete-btn')) {
              const button = event.target;
              const requestId = button.getAttribute('data-request-id');
              const responseId = button.getAttribute('data-response-id');
              deleteResponse(event, requestId, responseId);
          }
      });
  } else {
      console.error('Response container not found for event delegation.');
  }  

  // Other functionalities remain unchanged

  function addMessageItem(text = '', role = 'user') {
    const messageListElement = document.getElementById('messageList');
    const newMessageItem = document.createElement('div');
    newMessageItem.classList.add('flex', 'items-center', 'mb-2', 'bg-white', 'border', 'p-2', 'rounded', 'shadow');
    newMessageItem.innerHTML = `
      <textarea class="flex-grow border p-2 mr-2 rounded" rows="2" placeholder="Enter a message...">${text}</textarea>
      <select class="border p-2 rounded">
        <option value="user" ${role === 'user' ? 'selected' : ''}>User</option>
        <option value="assistant" ${role === 'assistant' ? 'selected' : ''}>Assistant</option>
        <option value="system" ${role === 'system' ? 'selected' : ''}>System</option>
      </select>
      <button class="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onclick="removeMessageItem(this)">X</button>
    `;
    messageListElement.appendChild(newMessageItem);
    console.log('Added new message item to list');
  }

  const addMessageButton = document.getElementById('addMessageButton');
  if (addMessageButton) {
    addMessageButton.addEventListener('click', () => {
      try {
        addMessageItem();
        console.log('New message item added.');
      } catch (error) {
        console.error('Failed to add new message item:', error.message, error.stack);
      }
    });
  } else {
    console.error('Add Message button not found');
  }

  // Add initial message item on load
  addMessageItem();

  // Function to load messages from JSON
  function loadMessagesFromJson() {
    try {
      const jsonTextarea = document.getElementById('jsonImportTextarea');
      const messages = JSON.parse(jsonTextarea.value);
      const messageList = document.getElementById('messageList');
      messageList.innerHTML = ''; // Clear existing messages
      
      messages.forEach(message => {
        addMessageItem(message.text, message.role); // Reuse function to add messages to the UI
      });
      console.log('Messages loaded from JSON.'); // Logging successful operation
    } catch (error) {
      // Proper error handling and logging with stack trace
      console.error('Failed to load messages from JSON:', error.message, error.stack);
      // Inform the user through the UI that there was an error
      const jsonErrorElement = document.getElementById('jsonError');
      if (jsonErrorElement) {
        jsonErrorElement.textContent = error.message;
        jsonErrorElement.classList.remove('hidden');
      } else {
        // If the error display element doesn't exist, log the error in the console
        console.error('JSON error display element not found in the UI.');
      }
    }
  }

  // Event listener for the Load Messages button
  const loadMessagesButton = document.getElementById('loadMessagesButton');
  if (loadMessagesButton) {
    loadMessagesButton.addEventListener('click', loadMessagesFromJson);
    console.log('Event listener for Load Messages button added.'); // Logging successful operation
  } else {
    // Error handling with proper logging if the element is not found
    console.error('Load Messages button not found');
  }

  // Function to handle OpenAI API errors
  function handleOpenAiError(error) {
    console.error('OpenAI Error:', error.message, error.stack);
  }

  // Function to display responses in real-time
  function displayRealTimeResponse(data) {
    const responseContainer = document.getElementById('responseContainer');
    const { response, requestId } = data;
    const responseElement = document.createElement('details');
    responseElement.id = `response-${requestId}`;
    
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('ml-2', 'bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
    deleteButton.textContent = 'Delete';
    console.log(`Attempting to attach delete event listener. Request ID: ${requestId}, Response ID: ${response.id}`); // gpt_pilot_debugging_log
    deleteButton.setAttribute('data-request-id', requestId);
    deleteButton.setAttribute('data-response-id', response.id);

    responseElement.innerHTML = `
      <summary>Response #${requestId}</summary>
      <p>${response.choices[0].message.content}</p>
    `;
    responseElement.appendChild(deleteButton);
    
    responseContainer.appendChild(responseElement);
    console.log(`Response #${requestId} displayed`);
  }

  // Function to collect messages and make a POST request on submit
  async function submitConversation() {
    try {
      const messageElements = document.querySelectorAll('#messageList > div');
      const messages = Array.from(messageElements).map(messageElement => {
        const textArea = messageElement.querySelector('textarea');
        const roleSelect = messageElement.querySelector('select');
        return {
          text: textArea.value,
          role: roleSelect.value
        };
      });
      const apiRequestsCount = parseInt(document.getElementById('apiRequestsCount').value, 10) || 0;
      if (Number.isNaN(apiRequestsCount) || apiRequestsCount < 0 || apiRequestsCount > 100) {
        throw new Error('The number of API requests must be between 0 and 100.');
      }
      if (socket === null) {
        console.log('Establishing WebSocket connection.');
        socket = io();
        socket.on('openai_real_response', displayRealTimeResponse);
        socket.on('openai_error', handleOpenAiError);
      }
      const response = await fetch('/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, apiRequestsCount }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log('Conversation submitted successfully.');
    } catch (error) {
      console.error('Failed to submit conversation:', error.message, error.stack);
    }
  }

  // Add event listener to the Save Conversation button
  const saveConversationButton = document.getElementById('saveConversationButton');
  if (saveConversationButton) {
    saveConversationButton.addEventListener('click', saveConversation);
  } else {
    console.error('Save Conversation button not found');
  }

  // Function to initiate the process of saving the current conversation state
  function saveConversation() {
    try {
      console.log('Initiating process to save the current conversation.');
      // Collect message items
      const messageItems = document.querySelectorAll('#messageList > div');
      const messages = Array.from(messageItems).map(item => {
        const textarea = item.querySelector('textarea');
        const select = item.querySelector('select');
        return {
          text: textarea.value,
          role: select.value
        };
      });
      
      // Collect OpenAI API responses from the UI
      const responseElements = document.querySelectorAll('#responseContainer > details');
      const responses = Array.from(responseElements).map(detail => {
        const summary = detail.querySelector('summary');
        const p = detail.querySelector('p');
        return {
          text: p ? p.textContent : '',
          requestNumber: summary ? Number(summary.textContent.replace('Response #', '')) : null
        };
      });

      const conversationName = `Conversation_${new Date().toISOString()}`;
      const payload = {
        name: conversationName,
        messages: messages,
        responses: responses 
      };
    
      // Send the POST request to '/api/save-conversation'
      fetch('/api/save-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Conversation saved successfully:', data);
        alert('Conversation saved successfully!');
      })
      .catch(error => {
        console.error('Error saving conversation:', error.message, error.stack);
        alert(`Error saving conversation: ${error.message}`);
      });
    } catch (error) {
      console.error('Failed to execute saveConversation function:', error.message, error.stack);
      alert(`Failed to save conversation: ${error.message}`);
    }
  }
  
  // Function to load and display a list of stored conversations
  function loadConversationsList() {
    console.log('Loading conversations list.'); // gpt_pilot_debugging_log
    fetch('/api/load-conversations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(conversations => {
      console.log('Conversations loaded:', conversations); // gpt_pilot_debugging_log
      const conversationsListContainer = document.getElementById('conversationsListContainer') || createConversationsListContainer();
      conversationsListContainer.innerHTML = ''; // Clear previous conversation list

      conversations.forEach(conversation => {
        const listItem = document.createElement('button');
        listItem.textContent = conversation.name;
        listItem.classList.add('block', 'text-left', 'p-2', 'hover:bg-gray-200', 'w-full', 'mt-1', 'relative');
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-1', 'px-2', 'rounded', 'absolute', 'right-0');
        deleteButton.onclick = () => deleteConversation(conversation._id);
        listItem.appendChild(deleteButton);
        conversationsListContainer.appendChild(listItem);
      });
      console.log('Conversations list loaded.');
    })
    .catch(error => {
      console.error('Failed to load conversations list:', error.message, error.stack); // gpt_pilot_debugging_log
    });
  }

  // Function to delete a conversation
  function deleteConversation(conversationId) {
    fetch(`/api/delete-conversation/${conversationId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      alert('Conversation deleted successfully.');
      loadConversationsList(); // Refresh the list
    })
    .catch(error => {
      console.error('Failed to delete conversation:', error.message, error.stack);
      alert(`Failed to delete conversation: ${error.message}`);
    });
  }

  // Add event listener to Load Conversation button
  const loadConversationButton = document.getElementById('loadConversationButton');
  if (loadConversationButton) {
    loadConversationButton.addEventListener('click', loadConversationsList);
  } else {
    console.error('Load Conversation button not found');
  }

  // Function to load and display a specific conversation's details
  function loadConversationDetails(conversationId) {
    console.log(`Loading conversation details for ID: ${conversationId}`); 
    fetch(`/api/load-conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(conversation => {
      document.getElementById('messageList').innerHTML = '';
      document.getElementById('responseContainer').innerHTML = '';

      conversation.messages.forEach((message) => {
        addMessageItem(message.text, message.role);
      });

      if (conversation.responses && Array.isArray(conversation.responses)) {
        conversation.responses.forEach((response, index) => {
          displayRealTimeResponse({
            response: response,
            requestId: index + 1
          }); // gpt_pilot_debugging_log
        });
      } else {
        console.log('No responses found for this conversation.'); // gpt_pilot_debugging_log
      }

      console.log('Conversation details loaded and displayed.'); // gpt_pilot_debugging_log
    }).catch(error => {
      console.error('Failed to load conversation details:', error.message, error.stack); // gpt_pilot_debugging_log
      alert(`Failed to load conversation details: ${error.message}`);
    });

  }

  let socket = null;
});