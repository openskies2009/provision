// Global state variables
let currentClientId = null;
let currentCollectionId = null;
let currentProjectId = null;
let currentFolderId = null;
let clientName = '';
let collectionName = '';
let projectName = '';
let currentSort = 'name'; // Default sort for files
let editingDocumentId = null;
let editingNoteId = null;
let editingLinkId = null;
let editingEventId = null;
let editingStationeryId = null;

// Utility function to clear error messages
function clearErrors() {
    const errorMessages = document.getElementById('errorMessages');
    if (errorMessages) {
        errorMessages.innerHTML = '';
    }
}

// Utility function to display error messages
function displayError(message) {
    const errorMessages = document.getElementById('errorMessages');
    if (errorMessages) {
        errorMessages.innerHTML = `<p>${message}</p>`;
    }
}

// Utility function to show temporary card messages
function showCardMessage(message) {
    const cardMessage = document.getElementById('cardMessage');
    if (cardMessage) {
        cardMessage.textContent = message;
        cardMessage.classList.add('show');
        setTimeout(() => {
            cardMessage.classList.remove('show');
        }, 3000); // Message disappears after 3 seconds
    }
}