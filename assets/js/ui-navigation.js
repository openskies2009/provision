function navigateToClient(clientId) {
    currentClientId = clientId;
    currentCollectionId = null;
    currentProjectId = null;
    currentFolderId = null;
    collectionName = '';
    projectName = '';
    loadCollections(clientId);
}

function navigateToCollection(collectionId) {
    currentCollectionId = collectionId;
    currentProjectId = null;
    currentFolderId = null;
    projectName = '';
    loadCollectionDetails(collectionId);

    // Highlight the selected collection and show its projects
    document.querySelectorAll('.collection-item').forEach(item => {
        const isSelected = item.dataset.id === collectionId;
        item.classList.toggle('selected', isSelected);
        const projectList = item.querySelector('.project-list');
        if (projectList) {
            projectList.style.display = isSelected ? 'block' : 'none';
        }
    });
}

function navigateToProject(projectId) {
    currentProjectId = projectId;
    currentFolderId = null;
    loadProjectDetails(projectId);

    // Highlight the selected project in the sidebar
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.id === projectId);
    });
}

function navigateToEvents(projectId) {
    currentProjectId = projectId;
    currentFolderId = null;
    loadEventDetails(projectId);

    // Highlight the selected project in the sidebar
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.id === projectId);
    });
}

function loadDetails() {
    clearErrors();
    if (currentProjectId) loadProjectDetails(currentProjectId);
    else if (currentCollectionId) loadCollectionDetails(currentCollectionId);
    else if (currentFolderId) loadFolderDetails(currentFolderId);
    else if (currentClientId) loadCollections(currentClientId);
    else loadClients();
}