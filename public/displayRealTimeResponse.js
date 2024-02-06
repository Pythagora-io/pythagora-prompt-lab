import { deleteResponse } from './responseDeletionHandler.js';

function displayResponseElement(responseId, responseText, conversationId) {
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
    deleteButton.classList.add('delete-response-btn', 'bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded', 'ml-4');
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this response?')) {
            deleteResponse(conversationId, responseId).catch(error => {
                console.error('Failed to delete response:', error.message, error.stack); // gpt_pilot_debugging_log
                alert(`Failed to delete response: ${error.message}`);
            });
        }
    });
    responseElement.appendChild(deleteButton);

    responseContainer.appendChild(responseElement);

    console.log(`Response for ${responseId} displayed successfully.`); // gpt_pilot_debugging_log
}

export function handleRealTimeResponse(responseData) {
    console.log('Handling real-time response:', responseData); // gpt_pilot_debugging_log

    // Adding a log to print the structure of responseData as part of debugging
    console.log(`Received response structure: `, JSON.stringify(responseData, null, 2)); // gpt_pilot_debugging_log

    if (!responseData) {
        console.error('Response data is undefined or null.', responseData); // gpt_pilot_debugging_log
        return;
    }
    
    if (!responseData.response || !responseData.response.choices || responseData.response.choices.length === 0) {
        console.error('Received response is empty or improperly formatted', responseData); // gpt_pilot_debugging_log
        return;
    }

    if (!responseData.conversationId) {
        console.error('Conversation ID is missing from the response data', responseData); // gpt_pilot_debugging_log
        return;
    }

    
    const responseId = responseData.responseId || `response-${Date.now()}`;
    console.log(`Determined responseId: ${responseId}`); // gpt_pilot_debugging_log

    // Extracting the text from the OpenAI response correctly,
    // and providing a default 'No text returned' message if the responseText is empty
    const responseText = responseData.response.choices[0].text || 'No text returned';
    console.log(`Generated responseId: ${responseId}, with text: ${responseText}`); // gpt_pilot_debugging_log
    
    displayResponseElement(responseId, responseText, responseData.conversationId);
}