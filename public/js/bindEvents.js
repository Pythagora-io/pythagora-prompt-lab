import { loadConversation } from './conversationHandler.js';

export function bindConversationEvents() {
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            loadConversation(item.dataset.conversationId);
        });
    });
    console.log('Event bindings for conversation items established.');
}