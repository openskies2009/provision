document.addEventListener('DOMContentLoaded', function() {
    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) addClientBtn.addEventListener('click', () => showPopup('client'));
    document.getElementById('saveClientBtn').addEventListener('click', saveClient);
    document.getElementById('cancelClientBtn').addEventListener('click', () => closePopup('client'));
    document.getElementById('saveCollectionBtn').addEventListener('click', saveCollection);
    document.getElementById('cancelCollectionBtn').addEventListener('click', () => closePopup('collection'));
    document.getElementById('saveFolderBtn').addEventListener('click', saveFolder);
    document.getElementById('cancelFolderBtn').addEventListener('click', () => closePopup('folder'));
    document.getElementById('saveProjectBtn').addEventListener('click', saveProject);
    document.getElementById('cancelProjectBtn').addEventListener('click', () => closePopup('project'));
    document.getElementById('saveDocumentBtn').addEventListener('click', saveDocument);
    document.getElementById('cancelDocumentBtn').addEventListener('click', () => closePopup('document'));
    document.getElementById('deleteDocumentBtn').addEventListener('click', () => showPopup('delete', editingDocumentId, 'document'));
    document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
    document.getElementById('cancelNoteBtn').addEventListener('click', () => closePopup('note'));
    document.getElementById('deleteNoteBtn').addEventListener('click', () => showPopup('delete', editingNoteId, 'note'));
    document.getElementById('fileInput').addEventListener('change', saveFiles);
    document.getElementById('cancelFileBtn').addEventListener('click', () => closePopup('file'));
    document.getElementById('saveLinkBtn').addEventListener('click', saveLink);
    document.getElementById('cancelLinkBtn').addEventListener('click', () => closePopup('link'));
    document.getElementById('deleteLinkBtn').addEventListener('click', () => showPopup('delete', editingLinkId, 'link'));
    document.getElementById('backToClientsBtn').addEventListener('click', () => {
        currentClientId = null;
        clientName = '';
        currentCollectionId = null;
        collectionName = '';
        loadClients();
    });
    document.getElementById('sortFiles').addEventListener('change', (e) => {
        currentSort = e.target.value;
        loadDetails();
    });
    document.getElementById('selectAllFilesBtn').addEventListener('click', () => {
        document.querySelectorAll('.file-select').forEach(cb => { cb.checked = true; });
        updateFileSelection();
    });
    document.getElementById('deselectAllFilesBtn').addEventListener('click', () => {
        document.querySelectorAll('.file-select').forEach(cb => { cb.checked = false; });
        updateFileSelection();
    });
    document.getElementById('zipFilesBtn').addEventListener('click', (e) => {
        if (!e.target.disabled) {
            showCardMessage('Preparing download, please wait...');
            zipSelectedFiles();
        }
    });
    document.getElementById('deleteSelectedFilesBtn').addEventListener('click', (e) => {
        if (!e.target.disabled) deleteSelectedFiles();
    });
    document.getElementById('generateContactSheetBtn').addEventListener('click', (e) => {
        if (!e.target.disabled) generateContactSheet();
    });
    document.getElementById('confirmDeleteFileBtn').addEventListener('click', () => {
        const fileId = document.getElementById('deleteFileId').value;
        if (fileId) {
            deleteItem('file', fileId);
            closePopup('deleteFile');
        }
    });
    document.getElementById('cancelDeleteFileBtn').addEventListener('click', () => closePopup('deleteFile'));
    document.getElementById('saveRenameFileBtn').addEventListener('click', () => {
        const fileId = document.getElementById('renameFileId').value;
        const newName = document.getElementById('renameFileName').value;
        if (fileId && newName) {
            renameFile(fileId, newName);
            closePopup('renameFile');
        }
    });
    document.getElementById('cancelRenameFileBtn').addEventListener('click', () => closePopup('renameFile'));
    document.getElementById('saveEventBtn').addEventListener('click', saveEvent);
    document.getElementById('cancelEventBtn').addEventListener('click', () => closePopup('event'));
    document.getElementById('deleteEventBtn').addEventListener('click', () => showPopup('delete', editingEventId, 'event'));
    document.getElementById('saveStationeryBtn').addEventListener('click', saveStationery);
    document.getElementById('cancelStationeryBtn').addEventListener('click', () => closePopup('stationery'));
    document.getElementById('deleteStationeryBtn').addEventListener('click', () => showPopup('delete', editingStationeryId, 'stationery'));
    document.getElementById('saveAddStationeryBtn').addEventListener('click', addStationeryToAsset);
    document.getElementById('cancelAddStationeryBtn').addEventListener('click', () => closePopup('add-stationery'));
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        const itemId = document.getElementById('deleteItemId').value;
        const itemType = document.getElementById('deleteItemType').value;
        if (itemId && itemType) {
            deleteItem(itemType, itemId);
            closePopup('delete');
        }
    });
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => closePopup('delete'));
    document.getElementById('copyIcsFeedBtn').addEventListener('click', () => {
        const link = document.getElementById('icsFeedLink');
        link.select();
        document.execCommand('copy');
        showCardMessage('ICS feed link copied');
    });
    document.getElementById('closeIcsFeedBtn').addEventListener('click', () => closePopup('ics-feed'));
    document.getElementById('stationeryPrintoutsLink').addEventListener('click', (e) => {
        e.preventDefault();
        loadStationeryPrintouts();
    });
    document.getElementById('calendarLink').addEventListener('click', (e) => {
        e.preventDefault();
        loadCalendar();
    });
    loadClients();
});

function handleActionButton(event) {
    const action = event.target.dataset.action;
    const projectId = event.target.dataset.projectId;
    const context = event.target.closest('.navigation-path')?.querySelector('.breadcrumb')?.dataset.context || 'backend';

    switch (action) {
        case 'add-client':
            showPopup('client');
            break;
        case 'add-collection':
            showPopup('collection');
            break;
        case 'add-project':
            showPopup('project');
            break;
        case 'edit-client':
            showPopup('client', currentClientId);
            break;
        case 'delete-client':
            showPopup('delete', currentClientId, 'client');
            break;
        case 'share-client':
            if (context === 'backend') {
                showSharePopup('client', currentClientId, true);
            }
            break;
        case 'edit-folder':
            showPopup('folder', currentFolderId);
            break;
        case 'delete-folder':
            showPopup('delete', currentFolderId, 'folder');
            break;
        case 'add-folder':
            showPopup('folder');
            break;
        case 'edit-collection':
            showPopup('collection', currentCollectionId);
            break;
        case 'delete-collection':
            showPopup('delete', currentCollectionId, 'collection');
            break;
        case 'share-collection':
            if (context === 'backend') {
                showSharePopup('collection', currentCollectionId, true);
            }
            break;
        case 'edit-project':
            showPopup('project', currentProjectId);
            break;
        case 'delete-project':
            showPopup('delete', currentProjectId, 'project');
            break;
        case 'share-project':
            if (context === 'backend') {
                showSharePopup('project', currentProjectId, true);
            }
            break;
        case 'toggle-favorite':
            toggleFavoriteProject(projectId, event.target.dataset.isFavorite === '0' ? 1 : 0);
            break;
        case 'add-document':
            showPopup('document');
            break;
        case 'edit-document':
            showPopup('document', editingDocumentId || event.target.closest('.item')?.dataset.id);
            break;
        case 'delete-document':
            showPopup('delete', editingDocumentId || event.target.closest('.item')?.dataset.id, 'document');
            break;
        case 'add-note':
            showPopup('note');
            break;
        case 'edit-note':
            showPopup('note', editingNoteId || event.target.closest('.item')?.dataset.id);
            break;
        case 'delete-note':
            showPopup('delete', editingNoteId || event.target.closest('.item')?.dataset.id, 'note');
            break;
        case 'add-files':
            showPopup('file');
            break;
        case 'delete-file':
            showPopup('delete', event.target.closest('.item')?.dataset.id, 'file');
            break;
        case 'add-link':
            showPopup('link');
            break;
        case 'edit-link':
            showPopup('link', editingLinkId || event.target.closest('.item')?.dataset.id);
            break;
        case 'delete-link':
            showPopup('delete', editingLinkId || event.target.closest('.item')?.dataset.id, 'link');
            break;
        case 'view-events':
            navigateToEvents(currentProjectId);
            break;
        case 'add-event':
            showPopup('event');
            break;
        case 'edit-event':
            showPopup('event', event.target.closest('.item')?.dataset.id);
            break;
        case 'delete-event':
            showPopup('delete', event.target.closest('.item')?.dataset.id, 'event');
            break;
        case 'add-stationery':
            showPopup('add-stationery');
            break;
        case 'edit-stationery':
            showPopup('stationery', event.target.closest('.item')?.dataset.id);
            break;
        case 'delete-stationery':
            showPopup('delete', event.target.closest('.item')?.dataset.id, 'stationery');
            break;
        case 'generate-stationery':
            generateStationery(event.target.closest('.item')?.dataset.id);
            break;
        case 'show-ics-feed':
            showPopup('ics-feed');
            break;
    }
}