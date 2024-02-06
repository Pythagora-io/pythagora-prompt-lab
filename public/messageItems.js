export function addMessageItem(text = '', role = 'user') {
  try {
    const messageListElement = document.getElementById('messageList');

    if (!messageListElement) {
      console.error('Message list element not found'); // gpt_pilot_debugging_log
      throw new Error('Message list element not found');
    }

    // Generate unique identifier for each message item
    const uniqueId = `message-item-${Date.now()}`;

    console.log(`Adding a new message item. ID: ${uniqueId}, Text: ${text}, Role: ${role}`); // gpt_pilot_debugging_log

    const newMessageItem = document.createElement('div');
    newMessageItem.id = uniqueId;
    newMessageItem.classList.add('flex', 'items-center', 'mb-2', 'bg-white', 'border', 'p-2', 'rounded', 'shadow');

    // Ensure the switch or if-else handling roles correctly sets the dropdown.
    const roleOptions = {
      user: role === 'user' ? 'selected' : '',
      assistant: role === 'assistant' ? 'selected' : '',
      system: role === 'system' ? 'selected' : ''
    };

    if (!['user', 'assistant', 'system'].includes(role)) {
      console.error(`Invalid role: ${role}`); // gpt_pilot_debugging_log
      throw new Error(`Invalid role: ${role}`);
    }

    newMessageItem.innerHTML += `
      <textarea class='message-textarea flex-grow border p-2 mr-2 rounded' rows='2' placeholder='Enter a message...'>${text}</textarea>
      <select class='role-select border p-2 rounded'>
        <option value='user' ${roleOptions.user}>User</option>
        <option value='assistant' ${roleOptions.assistant}>Assistant</option>
        <option value='system' ${roleOptions.system}>System</option>
      </select>
    `;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('delete-btn', 'ml-2', 'bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
    deleteButton.addEventListener('click', () => removeMessageItem(deleteButton, newMessageItem.id));

    newMessageItem.appendChild(deleteButton);
    messageListElement.appendChild(newMessageItem);

    console.log('New message item added successfully.'); // gpt_pilot_debugging_log
  } catch (error) {
    console.error('Failed to add message item:', error.message, error.stack); // gpt_pilot_debugging_log
  }
}

function removeMessageItem(element, messageId) {
  try {
    const messageItem = element.closest('div');
    if (messageItem && messageId) {
      messageItem.parentElement.removeChild(messageItem);
      console.log(`Message item with id ${messageId} removed successfully`); // gpt_pilot_debugging_log
    } else {
      console.error('Message item to remove not found or messageId is missing'); // gpt_pilot_debugging_log
      throw new Error('Message item to remove not found or messageId is missing');
    }
  } catch (error) {
    console.error('Failed to remove message item:', error.message, error.stack); // gpt_pilot_debugging_log
  }
}

export { removeMessageItem };