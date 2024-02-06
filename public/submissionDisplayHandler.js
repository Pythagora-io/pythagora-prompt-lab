export function displaySubmissionData(data) {
    const container = document.getElementById('responseContainer');
    if (!container) {
        console.error('Response container not found in the DOM');
        return;
    }
    container.innerHTML = '';
    const submissionDetails = document.createElement('pre');
    submissionDetails.textContent = JSON.stringify(data, null, 2);
    submissionDetails.classList.add('p-4', 'bg-gray-200', 'rounded', 'text-sm');
    container.appendChild(submissionDetails);
    console.log('Displayed submission data successfully.');
}