import { addMessageItem } from './messageItems.js';
import { bindConversationEvents } from './bindEvents.js';

export async function saveConversation() {
    const name = prompt('Enter a name for this conversation:').trim();
    const textAreas = document.querySelectorAll('#messageList textarea');
    const roles = document.querySelectorAll('#messageList select');
    const messages = Array.from(textAreas, (textArea, index) => ({
        text: textArea.value,
        role: roles[index].value
    }));
    // Include dummy responses to comply with expected data format
    const requestBody = { name, messages, responses: [] };
    try {
        const response = await fetch('/api/save-conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const errorDetail = await response.text();
            console.error(`Save Conversation failed: HTTP error! Status: ${response.status}, Details: ${errorDetail}`); // gpt_pilot_debugging_log
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorDetail}`);
        }
        console.log('Conversation saved successfully.', await response.json()); // gpt_pilot_debugging_log
        alert('Conversation saved successfully.');
    } catch (error) {
        console.error('Save Conversation failed:', error.message, error.stack); // gpt_pilot_debugging_log
        alert(`Save Conversation failed: ${error.message}`);
    }
}

export async function loadConversationsList() {
    console.log('Attempting to load conversations list.'); // gpt_pilot_debugging_log
    try {
        const response = await fetch('/api/load-conversations');
        if (!response.ok) {
            console.error(`Loading conversations list failed: HTTP error! Status: ${response.status}`); // gpt_pilot_debugging_log
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const conversations = await response.json();
        console.log('Conversations loaded:', conversations); // gpt_pilot_debugging_log
        const listContainer = document.getElementById('conversationsListContainer');
        listContainer.innerHTML = ''; // Clear previous conversations
        conversations.forEach(conversation => {
            const conversationItem = document.createElement('div');
            conversationItem.textContent = conversation.name;
            conversationItem.classList.add('cursor-pointer', 'hover:bg-gray-200', 'p-2');
            conversationItem.dataset.conversationId = conversation._id; // Store conversation ID in dataset for retrieval
            conversationItem.addEventListener('click', () => {
                console.log(`Loading conversation details for conversation with ID: ${conversation._id}`); // gpt_pilot_debugging_log
                loadConversation(conversation._id);
            });
            listContainer.appendChild(conversationItem);
        });
        console.log('Conversations list updated.'); // gpt_pilot_debugging_log
        bindConversationEvents(); // Ensure event listeners are set up for loaded conversation items
    } catch (error) {
        console.error('Failed to load conversations:', error.message, error.stack); // gpt_pilot_debugging_log
        alert(`Failed to load conversations: ${error.message}`);
    }
}

export async function loadConversation(conversationId) {
    console.log(`Attempting to load conversation with ID: ${conversationId}.`); // gpt_pilot_debugging_log
    try {
        const response = await fetch(`/api/load-conversations/${conversationId}`);
        if (!response.ok) {
            console.error(`Loading conversation failed: HTTP error! Status: ${response.status}`); // gpt_pilot_debugging_log
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const conversation = await response.json();
        console.log('Conversation loaded successfully:', conversation); // gpt_pilot_debugging_log
        displayLoadedConversation(conversation);
    } catch (error) {
        console.error('Failed to load conversation:', error.message, error.stack); // gpt_pilot_debugging_log
        alert(`Failed to load conversation: ${error.message}`);
    }
}

function displayLoadedConversation(conversation) {
    const messageListElement = document.getElementById('messageList');
    messageListElement.innerHTML = ''; // Clear existing messages
    conversation.messages.forEach(message => {
        console.log(`Adding message: ${message.text} with role: ${message.role}`); // gpt_pilot_debugging_log
        addMessageItem(message.text, message.role);
    });
    console.log(`Displayed loaded conversation: ${conversation.name}`); // gpt_pilot_debugging_log
}

function bindConversationEvents() {
    console.log('Binding event listeners for conversation items.'); // gpt_pilot_debugging_log
    document.querySelectorAll('.cursor-pointer').forEach(item => {
        item.addEventListener('click', () => {
            const conversationId = item.dataset.conversationId;
            console.log(`Conversation item clicked: Loading conversation with ID: ${conversationId}`); // gpt_pilot_debugging_log
            loadConversation(conversationId);
        });
    });
}