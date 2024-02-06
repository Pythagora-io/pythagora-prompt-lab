export function deleteResponse(conversationId, responseId) {
  return new Promise((resolve, reject) => {
    console.log(`Attempting to delete response. Conversation ID: ${conversationId}, Response ID: ${responseId}`); // gpt_pilot_debugging_log
    console.log(`Attempting to delete response with ID: ${responseId} from conversation: ${conversationId}.`); // gpt_pilot_debugging_log
    fetch(`/api/delete-response/${conversationId}/${responseId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        console.error(`Delete response failed with status: ${response.status}`, { conversationId, responseId }); // gpt_pilot_debugging_log
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Response with ID: ${responseId} in conversation: ${conversationId}, deleted successfully.`, data); // gpt_pilot_debugging_log
      resolve();
    })
    .catch(error => {
      console.error('Failed to delete response:', error.message, error.stack, { conversationId, responseId }); // gpt_pilot_debugging_log
      reject(error);
    });
  });
}