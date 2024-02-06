import { clearResponseContainer } from './responseHandler.js';

function submitConversation() {
    console.log('Preparing to submit conversation.'); // gpt_pilot_debugging_log
    clearResponseContainer(); // Clear responses from previous submissions
    console.log('Cleared previous responses.'); // gpt_pilot_debugging_log

    const textAreas = document.querySelectorAll('#messageList textarea');
    const roles = document.querySelectorAll('#messageList select');
    const messages = Array.from(textAreas).map((textArea, index) => ({
        text: textArea.value,
        role: roles[index].value
    }));
    const apiRequestsCount = parseInt(document.getElementById('apiRequestsCount').value, 10);
    if (!messages.length || isNaN(apiRequestsCount)) {
        console.error('Invalid messages or apiRequestsCount'); // gpt_pilot_debugging_log
        return;
    }
    const requestBody = {
        messages,
        apiRequestsCount
    };

    console.log('Submitting conversation with the following data:', requestBody); // gpt_pilot_debugging_log

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(async response => {
        if (!response.ok) {
            const errorDetail = await response.text();
            console.error(`Submit Conversation failed: HTTP error! Status: ${response.status}, Details: ${errorDetail}`); // gpt_pilot_debugging_log
            alert(`Submission error: ${errorDetail}`);
            return;
        }
        console.log('Conversation submitted successfully, waiting for responses.'); // gpt_pilot_debugging_log
    })
    .catch(error => {
        console.error('Submit Conversation failed:', error.message, error.stack); // gpt_pilot_debugging_log
    });
}

function saveConversation() {
    console.log('saveConversation function triggered.'); // gpt_pilot_debugging_log
    alert('Save Conversation is not yet implemented.');
}

function loadConversationsList() {
    console.log('loadConversationsList function triggered.'); // gpt_pilot_debugging_log
    alert('Load Conversations is not yet implemented.');
}

export { submitConversation, saveConversation, loadConversationsList };