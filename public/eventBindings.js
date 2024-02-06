import { submitConversation } from './submissionHandler.js';
import { saveConversation, loadConversationsList } from './conversationHandler.js';

function bindEvents() {
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            try {
                submitConversation();
                console.log('Submit button clicked.'); // gpt_pilot_debugging_log
            } catch (error) {
                console.error('Error when clicking Submit button:', error.message, error.stack); // gpt_pilot_debugging_log
                alert(`Error during submission: ${error.message}`);
            }
        });
    } else {
        console.error('Submit button not found.'); // gpt_pilot_debugging_log
    }

    const saveConversationButton = document.getElementById('saveConversationButton');
    if (saveConversationButton) {
        saveConversationButton.addEventListener('click', (event) => {
            event.preventDefault();
            try {
                saveConversation();
                console.log('Save Conversation button clicked.'); // gpt_pilot_debugging_log
            } catch (error) {
                console.error('Error when clicking Save Conversation button:', error.message, error.stack); // gpt_pilot_debugging_log
                alert(`Error during saving conversation: ${error.message}`);
            }
        });
    } else {
        console.error('Save Conversation button not found.'); // gpt_pilot_debugging_log
    }

    const loadConversationButton = document.getElementById('loadConversationButton');
    if (loadConversationButton) {
        loadConversationButton.addEventListener('click', (event) => {
            event.preventDefault();
            try {
                loadConversationsList();
                console.log('Load Conversation button clicked.'); // gpt_pilot_debugging_log
            } catch (error) {
                console.error('Failed to load conversations:', error.message, error.stack); // gpt_pilot_debugging_log
                alert(`Failed to load conversations: ${error.message}`);
            }
        });
    } else {
        console.error('Load Conversation button not found.'); // gpt_pilot_debugging_log
    }
}

export { bindEvents };