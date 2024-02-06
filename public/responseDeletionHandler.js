function deleteResponse(conversationId, responseId) {
  console.log(`Attempting to delete response with ID: ${responseId} from conversation: ${conversationId}.`); // gpt_pilot_debugging_log
  if (!conversationId || !responseId) {
    console.error('Missing conversationId or responseId for deletion', { conversationId, responseId }); // gpt_pilot_debugging_log
    alert('Missing conversation ID or response ID for deletion.');
    return;
  }

  fetch(`/api/delete-response/${conversationId}/${responseId}`, {
    method: 'DELETE'
  }).then(response => {
    if (!response.ok) {
      console.error(`Failed to delete the response with ID: ${responseId}. HTTP Status: ${response.status}`); // gpt_pilot_debugging_log
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log(`Response with ID: ${responseId} in conversation: ${conversationId}, deleted successfully.`); // gpt_pilot_debugging_log
    const responseElement = document.getElementById(`response-${responseId}`);
    if (responseElement) {
      responseElement.remove();
    } else {
      console.error(`Failed to find response element with ID: ${responseId} in DOM to remove.`); // gpt_pilot_debugging_log
    }
  }).catch(error => {
    console.error('Failed to delete response:', error.message, error.stack); // gpt_pilot_debugging_log
    alert(`Failed to delete response: ${error.message}`);
  });
}

export { deleteResponse };