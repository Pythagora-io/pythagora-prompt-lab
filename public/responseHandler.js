export function displayResponseInUI(data) {
    // Adding initial data logging for debugging purposes
    console.log('Displaying response in UI:', data); // gpt_pilot_debugging_log

    const responseContainer = document.getElementById('responseContainer');
    if (!responseContainer) {
        console.error('Response container not found in the DOM', { error: 'Dom element with id responseContainer not found.' }); // gpt_pilot_debugging_log
        return;
    }

    // Validate the structure of the data received, adding logging for debugging
    console.log(`Response data to be displayed: `, data); // gpt_pilot_debugging_log
    if (!data || !data.response || !data.response.choices || data.response.choices.length === 0) {
        console.error(`Invalid response data structure or empty response:`, data); // gpt_pilot_debugging_log
        return;
    }

    const responseElement = document.createElement('div');
    responseElement.classList.add('response-item', 'mb-4', 'p-4', 'bg-white', 'rounded-lg', 'shadow');
    responseElement.setAttribute('id', `response-${data.responseId}`);

    const responseText = document.createElement('p');
    responseText.textContent = `Response: ${data.response.choices[0].text}`;
    responseElement.appendChild(responseText);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-response-btn', 'bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded', 'ml-auto');
    deleteButton.onclick = function () {
        try {
            const elementToRemove = document.getElementById(`response-${data.responseId}`);
            if (elementToRemove) {
                elementToRemove.remove();
                console.log(`Response with ID: ${data.responseId} deleted successfully.`); // gpt_pilot_debugging_log
            } else {
                console.warn(`Unable to find element with ID: ${data.responseId} for deletion.`); // gpt_pilot_debugging_log
            }
        } catch (error) {
            console.error(`Error deleting response with ID: ${data.responseId}:`, error.message, error.stack); // gpt_pilot_debugging_log
        }
    };
    responseElement.appendChild(deleteButton);

    responseContainer.appendChild(responseElement);

    console.log(`Response for ${data.responseId} displayed successfully.`); // gpt_pilot_debugging_log
}

export function clearResponseContainer() {
    console.log('Attempting to clear response container'); // gpt_pilot_debugging_log
    const responseContainer = document.getElementById('responseContainer');
    if (responseContainer) {
        responseContainer.innerHTML = '';
        console.log('Response container cleared successfully.'); // gpt_pilot_debugging_log
    } else {
        console.error('Failed to clear response container: Response container not found.'); // gpt_pilot_debugging_log
    }
}