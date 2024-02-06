export function setupEventHandlers() {
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
      const element = event.target;
      removeMessageItem(element);
      console.log('Delete button clicked and handler executed successfully.');
    }
  });
  console.log('Event handlers set up successfully.');
}