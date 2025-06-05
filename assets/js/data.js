function saveClient() {
    const name = document.getElementById('clientName').value.trim();
    if (!name) {
        displayError('Client name is required');
        return;
    }
    const data = { name };
    if (currentClientId) {
        data.id = currentClientId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('client');
                showCardMessage('Client updated successfully');
                loadCollections(currentClientId);
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('client');
                showCardMessage('Client added successfully');
                loadClients();
            });
    }
}

function saveCollection() {
    const name = document.getElementById('collectionName').value.trim();
    if (!name) {
        displayError('Collection name is required');
        return;
    }
    const data = { name, client_id: currentClientId };
    if (currentCollectionId) {
        data.id = currentCollectionId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('collection');
                showCardMessage('Collection updated successfully');
                loadCollections(currentClientId);
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('collection');
                showCardMessage('Collection added successfully');
                loadCollections(currentClientId);
            });
    }
}

function saveFolder() {
    const name = document.getElementById('folderName').value.trim();
    const type = document.getElementById('folderType').value;
    if (!name) {
        displayError('Folder name is required');
        return;
    }
    const data = { name, type };
    if (currentProjectId) data.project_id = currentProjectId;
    if (currentCollectionId) data.collection_id = currentCollectionId;
    if (currentFolderId) {
        data.id = currentFolderId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('folder');
                showCardMessage('Folder updated successfully');
                loadDetails();
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('folder');
                showCardMessage('Folder added successfully');
                loadDetails();
            });
    }
}

function saveProject() {
    const name = document.getElementById('projectName').value.trim();
    const allowRatings = document.getElementById('allowRatings').checked;
    const allowComments = document.getElementById('allowComments').checked;
    const dueDate = document.getElementById('dueDate').value;
    const finalCost = document.getElementById('finalCost').value;
    const status = document.getElementById('projectStatus').value;
    if (!name) {
        displayError('Project name is required');
        return;
    }
    const data = {
        name,
        client_id: currentClientId,
        collection_id: currentCollectionId,
        folder_id: currentFolderId,
        allow_ratings: allowRatings ? 1 : 0,
        allow_comments: allowComments ? 1 : 0,
        due_date: dueDate || null,
        final_cost: finalCost || null,
        status
    };
    if (currentProjectId) {
        data.id = currentProjectId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('project');
                showCardMessage('Project updated successfully');
                loadCollections(currentClientId);
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('project');
                showCardMessage('Project added successfully');
                loadCollections(currentClientId);
            });
    }
}

function saveDocument() {
    const title = document.getElementById('documentTitle').value.trim();
    const content = tinymce.get('documentContent').getContent();
    if (!title) {
        displayError('Document title is required');
        return;
    }
    const data = { title, content, project_id: currentProjectId };
    if (currentFolderId) data.folder_id = currentFolderId;
    if (editingDocumentId) {
        data.id = editingDocumentId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('document');
                showCardMessage('Document updated successfully');
                loadDetails();
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('document');
                showCardMessage('Document added successfully');
                loadDetails();
            });
    }
}

function saveNote() {
    const content = document.getElementById('noteContent').value.trim();
    if (!content) {
        displayError('Note content is required');
        return;
    }
    const data = { content, project_id: currentProjectId };
    if (currentFolderId) data.folder_id = currentFolderId;
    if (editingNoteId) {
        data.id = editingNoteId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('note');
                showCardMessage('Note updated successfully');
                loadDetails();
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('note');
                showCardMessage('Note added successfully');
                loadDetails();
            });
    }
}

function saveFiles() {
    const files = document.getElementById('fileInput').files;
    if (files.length === 0) {
        displayError('No files selected');
        return;
    }
    const formData = new FormData();
    formData.append('project_id', currentProjectId);
    for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
    }
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = '';
    for (let i = 0; i < files.length; i++) {
        const progressDiv = document.createElement('div');
        progressDiv.innerHTML = `
            <p>${files[i].name}</p>
            <progress value="0" max="100"></progress>
            <span>0%</span>
        `;
        progressContainer.appendChild(progressDiv);
    }
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            const progressBars = progressContainer.querySelectorAll('progress');
            progressBars.forEach(bar => {
                bar.value = percentComplete;
                bar.nextElementSibling.textContent = `${percentComplete}%`;
            });
        }
    };
    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.status === 'success') {
                closePopup('file');
                showCardMessage('Files uploaded successfully');
                loadDetails();
            } else {
                displayError(response.error || 'Failed to upload files');
            }
        } else {
            displayError('Failed to upload files');
        }
    };
    xhr.open('POST', 'https://peterfriedlander.tv/provision/api.php?action=save_files', true);
    xhr.send(formData);
}

function saveLink() {
    const url = document.getElementById('linkUrl').value.trim();
    const title = document.getElementById('linkTitle').value.trim();
    if (!url || !title) {
        displayError('URL and title are required');
        return;
    }
    const data = { url, title, project_id: currentProjectId };
    if (currentFolderId) data.folder_id = currentFolderId;
    if (editingLinkId) {
        data.id = editingLinkId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('link');
                showCardMessage('Link updated successfully');
                loadDetails();
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('link');
                showCardMessage('Link added successfully');
                loadDetails();
            });
    }
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const datetime = document.getElementById('eventDateTime').value;
    const note = document.getElementById('eventNote').value.trim();
    const showOnStationery = document.getElementById('eventShowOnStationery').checked;
    if (!title || !datetime) {
        displayError('Event title and date/time are required');
        return;
    }
    const data = {
        title,
        datetime,
        note,
        project_id: currentProjectId,
        show_on_stationery: showOnStationery ? 1 : 0
    };
    if (editingEventId) {
        data.id = editingEventId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('event');
                showCardMessage('Event updated successfully');
                loadEventDetails(currentProjectId);
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('event');
                showCardMessage('Event added successfully');
                loadEventDetails(currentProjectId);
            });
    }
}

function saveStationery() {
    const title = document.getElementById('stationeryTitle').value.trim();
    const type = document.getElementById('stationeryType').value;
    const assetType = document.getElementById('stationeryAsset').value;
    const assetId = document.getElementById('stationeryAssetId').value.trim();
    const content = tinymce.get('stationeryContent').getContent();
    if (!title) {
        displayError('Stationery title is required');
        return;
    }
    const data = { title, type, asset_type: assetType, content };
    if (assetType !== 'General' && assetId) data.asset_id = assetId;
    if (editingStationeryId) {
        data.id = editingStationeryId;
        fetch('https://peterfriedlander.tv/provision/api.php?action=update_stationery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('stationery');
                showCardMessage('Stationery updated successfully');
                loadStationeryPrintouts();
            });
    } else {
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_stationery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                closePopup('stationery');
                showCardMessage('Stationery added successfully');
                loadStationeryPrintouts();
            });
    }
}

function addStationeryToAsset() {
    const stationeryId = document.getElementById('stationerySelect').value;
    if (!stationeryId) {
        displayError('Please select a stationery template');
        return;
    }
    const assetType = currentProjectId ? 'Project' : 'Client';
    const assetId = currentProjectId || currentClientId;
    fetch('https://peterfriedlander.tv/provision/api.php?action=add_stationery_to_asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationery_id: stationeryId, asset_type: assetType, asset_id: assetId })
    })
        .then(response => response.json())
        .then(result => {
            closePopup('add-stationery');
            showCardMessage('Stationery added successfully');
            loadDetails();
        });
}

function deleteItem(type, id) {
    fetch(`https://peterfriedlander.tv/provision/api.php?action=delete_${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
        .then(response => response.json())
        .then(result => {
            showCardMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
            if (type === 'stationery') {
                loadStationeryPrintouts();
            } else {
                loadDetails();
            }
        });
}

function renameFile(fileId, newName) {
    fetch('https://peterfriedlander.tv/provision/api.php?action=rename_file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId, name: newName })
    })
        .then(response => response.json())
        .then(result => {
            showCardMessage('File renamed successfully');
            loadDetails();
        });
}

function toggleFavoriteProject(projectId, isFavorite) {
    fetch('https://peterfriedlander.tv/provision/api.php?action=toggle_favorite_project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, is_favorite: isFavorite })
    })
        .then(response => response.json())
        .then(result => {
            showCardMessage(isFavorite ? 'Project favorited' : 'Project unfavorited');
            loadDetails();
        });
}

function updateProjectCollection(projectId, collectionId) {
    fetch('https://peterfriedlander.tv/provision/api.php?action=update_project_collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, collection_id: collectionId })
    })
        .then(response => response.json())
        .then(result => {
            showCardMessage('Project moved to collection');
            loadDetails();
        });
}

function updateItemFolder(type, itemId, folderId) {
    fetch('https://peterfriedlander.tv/provision/api.php?action=update_item_folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, item_id: itemId, folder_id: folderId })
    })
        .then(response => response.json())
        .then(result => {
            showCardMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} moved to folder`);
            loadDetails();
        });
}

function zipSelectedFiles() {
    const selectedFiles = Array.from(document.querySelectorAll('.file-select:checked')).map(cb => cb.dataset.id);
    if (selectedFiles.length === 0) {
        displayError('No files selected');
        return;
    }
    fetch('https://peterfriedlander.tv/provision/api.php?action=zip_files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_ids: selectedFiles })
    })
        .then(response => {
            const blob = response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'selected_files.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
}

function deleteSelectedFiles() {
    const selectedFiles = Array.from(document.querySelectorAll('.file-select:checked')).map(cb => cb.dataset.id);
    if (selectedFiles.length === 0) {
        displayError('No files selected');
        return;
    }
    fetch('https://peterfriedlander.tv/provision/api.php?action=delete_multiple_files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_ids: selectedFiles })
    })
        .then(response => response.json())
        .then(result => {
            showCardMessage('Selected files deleted successfully');
            loadDetails();
        });
}

function generateContactSheet() {
    const selectedFiles = Array.from(document.querySelectorAll('.file-select:checked')).map(cb => cb.dataset.id);
    if (selectedFiles.length === 0) {
        displayError('No files selected');
        return;
    }
    fetch('https://peterfriedlander.tv/provision/api.php?action=generate_contact_sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_ids: selectedFiles })
    })
        .then(response => response.json())
        .then(data => {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(data.html);
            newWindow.document.close();
        });
}

function showSharePopup(type, id, isPublic) {
    const context = document.querySelector('.navigation-path .breadcrumb')?.dataset.context || 'backend';
    if (context !== 'backend') {
        displayError('Share functionality is not available in this context');
        return;
    }

    fetch('https://peterfriedlander.tv/provision/api.php?action=generate_share_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, item_id: id })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                displayError(data.error);
                return;
            }
            const shareLink = document.getElementById('shareLink');
            const isPublicCheckbox = document.getElementById('isPublic');
            shareLink.value = `https://peterfriedlander.tv/provision/share.php?token=${data.token}`;
            isPublicCheckbox.checked = isPublic;
            document.getElementById('copyShareLinkBtn').onclick = () => {
                shareLink.select();
                document.execCommand('copy');
                showCardMessage('Share link copied');
            };
            document.getElementById('closeShareBtn').onclick = () => closePopup('share');
            showPopup('share');
        })
        .catch(error => {
            displayError('Failed to generate share link');
        });
}