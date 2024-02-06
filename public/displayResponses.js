export function displayResponseInUI(data) {
    const responseContainer = document.getElementById('responseContainer');
    if (!responseContainer) {
        console.error('Response container not found in the DOM');
        return;
    }
    const responseElement = document.createElement('div');
    responseElement.classList.add('response-item', 'mb-4', 'p-4', 'bg-white', 'rounded-lg', 'shadow');
    responseElement.setAttribute('id', `response-${data.responseId}`);

    const responseText = document.createElement('p');
    responseText.textContent = `Response: ${data.response.choices[0].text}`;
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-response-btn', 'bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded', 'ml-auto');
    deleteButton.onclick = function () {
        console.log(`Delete response button clicked for response ID: ${data.responseId}`);
        document.getElementById(`response-${data.responseId}`).remove();
    };

    responseElement.appendChild(responseText);
    responseElement.appendChild(deleteButton);
    responseContainer.appendChild(responseElement);
}