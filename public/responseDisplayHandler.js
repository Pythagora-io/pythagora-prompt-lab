export function handleRealTimeResponse(data) {
    console.log('Handling real-time response', data); // gpt_pilot_debugging_log
    if (!data || !data.response || !data.response.choices || data.response.choices.length <= 0) {
        console.error('Invalid response structure received.', data); // gpt_pilot_debugging_log
        return;
    }

    const responseId = data.responseId || `response-${Date.now()}`;
    const responseText = data.response.choices[0].text;

    displayResponseInUI(responseId, responseText, data.conversationId);
}

function displayResponseInUI(responseId, responseText, conversationId) {
    const responseContainer = document.getElementById('responseContainer');
    if (!responseContainer) {
        console.error('Response container not found', { error: 'DOM element with id \"responseContainer\" not found.' }); // gpt_pilot_debugging_log
        return;
    }

    const responseElement = document.createElement('div');
    responseElement.classList.add('response-item', 'mb-4', 'p-4', 'bg-white', 'rounded-lg', 'shadow');
    responseElement.setAttribute('id', responseId);

    const textElement = document.createElement('p');
    textElement.textContent = responseText;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('ml-4', 'bg-red-500', 'text-white', 'p-2', 'rounded');
    deleteButton.onclick = () => document.getElementById(responseId).remove();

    responseElement.appendChild(textElement);
    responseElement.appendChild(deleteButton);

    responseContainer.appendChild(responseElement);

    console.log(`Displayed response for ${responseId} successfully.`); // gpt_pilot_debugging_log
}