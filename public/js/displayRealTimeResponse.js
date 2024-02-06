import { deleteResponse } from './responseDeletionHandler.js';

export function handleRealTimeResponse(responseData) {
    console.log('Received real-time response data:', JSON.stringify(responseData, null, 2)); // gpt_pilot_debugging_log
    console.log('Handling real-time response:', responseData); // gpt_pilot_debugging_log

    if (!responseData || !responseData.response || !responseData.response.choices || responseData.response.choices.length === 0) {
        console.error('Invalid or empty response data.', responseData); // gpt_pilot_debugging_log
        return;
    }

    // Added check for 'system' message role for debugging purposes
    if (responseData.role === 'system') {
      console.log('Displaying system message in UI', responseData); // gpt_pilot_debugging_log
    }

    const responseId = responseData.responseId || `response-${Date.now()}`;
    const responseText = responseData.response.choices[0].text; // Assuming the correct property is text
    console.log(`Generated responseId: ${responseId}, with text: ${responseText}`); // gpt_pilot_debugging_log

    displayResponseElement(responseId, responseText, responseData.conversationId);
}

function displayResponseElement(responseId, responseText, conversationId) {
    console.log(`Attempting to display response element. Conversation ID: ${conversationId}, Response ID: ${responseId}`); // gpt_pilot_debugging_log
    const responseContainer = document.getElementById('responseContainer');
    if (!responseContainer) {
        console.error('Response container not found in the DOM'); // gpt_pilot_debugging_log
        return;
    }

    const responseElement = document.createElement('div');
    responseElement.setAttribute('id', `response-${responseId}`);
    responseElement.classList.add('response-item', 'mb-4', 'p-4', 'bg-white', 'rounded-lg', 'shadow');

    const textElement = document.createElement('p');
    textElement.textContent = responseText;
    responseElement.appendChild(textElement);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-response-btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4';
    
    deleteButton.onclick = function() {
        console.log(`Delete button clicked for Conversation ID: ${conversationId}, Response ID: ${responseId}.`); // gpt_pilot_debugging_log
        deleteResponse(conversationId, responseId).then(() => {
            console.log(`Response with ID ${responseId} was successfully deleted.`); // gpt_pilot_debugging_log
            document.getElementById(`response-${responseId}`).remove();
        }).catch(error => {
            console.error(`Failed to delete the response with ID: ${responseId}: ${error.message}`, error.stack); // gpt_pilot_debugging_log
            alert(`Error deleting response: ${error.message}`);
        });
    };
    
    responseElement.appendChild(deleteButton);

    responseContainer.appendChild(responseElement);

    console.log(`Response with ID: ${responseId} displayed successfully.`); // gpt_pilot_debugging_log
}