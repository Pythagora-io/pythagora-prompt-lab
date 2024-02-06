export function initiateOpenAiRequest(message) {
    console.log('Initiating request to OpenAI with message:', message);
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: [{ text: message, role: 'user' }], apiRequestsCount: 1 })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received response from OpenAI:', data);
        displayResponseInUI(data);
    })
    .catch(error => console.error('Error fetching response from OpenAI:', error));
}

function displayResponseInUI(data) {
    const responseContainer = document.getElementById('responseContainer');
    if (!responseContainer) {
        console.error('Response container not found');
        return;
    }
    responseContainer.innerHTML = '';
    data.forEach((responseData, index) => {
        const responseElement = document.createElement('div');
        responseElement.classList.add('response-item', 'p-4', 'bg-gray-100', 'rounded', 'mt-2');
        responseElement.textContent = `Response ${index + 1}: ${responseData.response.choices[0].text}`;
        responseContainer.appendChild(responseElement);
    });
}