function showPopup(type, id) {
    const popup = document.getElementById(`${type}Popup`);
    if (!popup) return;

    popup.style.display = 'flex';

    switch (type) {
        case 'client':
            document.getElementById('clientName').value = '';
            document.getElementById('clientPopupTitle').textContent = id ? 'Edit Client' : 'Add Client';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_client&id=${id}`)
                    .then(response => response.json())
                    .then(client => {
                        document.getElementById('clientName').value = client.name;
                    });
            }
            break;

        case 'collection':
            document.getElementById('collectionName').value = '';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_collection&id=${id}`)
                    .then(response => response.json())
                    .then(collection => {
                        document.getElementById('collectionName').value = collection.name;
                    });
            }
            break;

        case 'folder':
            document.getElementById('folderName').value = '';
            document.getElementById('folderType').value = 'Files';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_folders&id=${id}`)
                    .then(response => response.json())
                    .then(folder => {
                        document.getElementById('folderName').value = folder.name;
                        document.getElementById('folderType').value = folder.type || 'Files';
                    });
            }
            break;

        case 'project':
            document.getElementById('projectName').value = '';
            document.getElementById('allowRatings').checked = false;
            document.getElementById('allowComments').checked = false;
            document.getElementById('dueDate').value = '';
            document.getElementById('finalCost').value = '';
            document.getElementById('projectStatus').value = 'Running';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_project&id=${id}`)
                    .then(response => response.json())
                    .then(project => {
                        document.getElementById('projectName').value = project.name;
                        document.getElementById('allowRatings').checked = project.allow_ratings === 1;
                        document.getElementById('allowComments').checked = project.allow_comments === 1;
                        document.getElementById('dueDate').value = project.due_date || '';
                        document.getElementById('finalCost').value = project.final_cost || '';
                        document.getElementById('projectStatus').value = project.status || 'Running';
                    });
            }
            break;

        case 'document':
            document.getElementById('documentTitle').value = '';
            tinymce.get('documentContent').setContent('');
            editingDocumentId = id;
            document.getElementById('deleteDocumentBtn').style.display = id ? 'inline-block' : 'none';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_document&id=${id}`)
                    .then(response => response.json())
                    .then(document => {
                        document.getElementById('documentTitle').value = document.title;
                        tinymce.get('documentContent').setContent(document.content || '');
                    });
            }
            break;

        case 'note':
            document.getElementById('noteContent').value = '';
            editingNoteId = id;
            document.getElementById('deleteNoteBtn').style.display = id ? 'inline-block' : 'none';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_note&id=${id}`)
                    .then(response => response.json())
                    .then(note => {
                        document.getElementById('noteContent').value = note.content;
                    });
            }
            break;

        case 'link':
            document.getElementById('linkUrl').value = '';
            document.getElementById('linkTitle').value = '';
            editingLinkId = id;
            document.getElementById('deleteLinkBtn').style.display = id ? 'inline-block' : 'none';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_link&id=${id}`)
                    .then(response => response.json())
                    .then(link => {
                        document.getElementById('linkUrl').value = link.url;
                        document.getElementById('linkTitle').value = link.title;
                    });
            }
            break;

        case 'event':
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventDateTime').value = '';
            document.getElementById('eventNote').value = '';
            document.getElementById('eventShowOnStationery').checked = false;
            editingEventId = id;
            document.getElementById('deleteEventBtn').style.display = id ? 'inline-block' : 'none';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_event&id=${id}`)
                    .then(response => response.json())
                    .then(event => {
                        document.getElementById('eventTitle').value = event.title;
                        document.getElementById('eventDateTime').value = event.datetime;
                        document.getElementById('eventNote').value = event.note || '';
                        document.getElementById('eventShowOnStationery').checked = event.show_on_stationery === 1;
                    });
            }
            break;

        case 'stationery':
            document.getElementById('stationeryTitle').value = '';
            document.getElementById('stationeryType').value = 'Contract';
            document.getElementById('stationeryAsset').value = 'General';
            document.getElementById('stationeryAssetId').style.display = 'none';
            document.getElementById('stationeryAssetId').value = '';
            tinymce.get('stationeryContent').setContent('');
            editingStationeryId = id;
            document.getElementById('deleteStationeryBtn').style.display = id ? 'inline-block' : 'none';
            if (id) {
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_stationery&id=${id}`)
                    .then(response => response.json())
                    .then(stationery => {
                        document.getElementById('stationeryTitle').value = stationery.title;
                        document.getElementById('stationeryType').value = stationery.type || 'Contract';
                        document.getElementById('stationeryAsset').value = stationery.asset_type || 'General';
                        if (stationery.asset_type !== 'General') {
                            document.getElementById('stationeryAssetId').style.display = 'block';
                            document.getElementById('stationeryAssetId').value = stationery.asset_id || '';
                        }
                        tinymce.get('stationeryContent').setContent(stationery.content || '');
                    });
            }
            document.getElementById('stationeryAsset').addEventListener('change', (e) => {
                const assetType = e.target.value;
                document.getElementById('stationeryAssetId').style.display = assetType === 'General' ? 'none' : 'block';
            });
            break;

        case 'add-stationery':
            const select = document.getElementById('stationerySelect');
            select.innerHTML = '<option value="">Select Stationery</option>';
            fetch('https://peterfriedlander.tv/provision/api.php?action=get_all_stationeries')
                .then(response => response.json())
                .then(stationeries => {
                    stationeries.forEach(stationery => {
                        const option = document.createElement('option');
                        option.value = stationery.id;
                        option.textContent = stationery.title;
                        select.appendChild(option);
                    });
                });
            break;

        case 'delete':
            document.getElementById('deleteItemId').value = id;
            document.getElementById('deleteItemType').value = type;
            document.getElementById('deletePopupTitle').textContent = `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            break;

        case 'ics-feed':
            fetch('https://peterfriedlander.tv/provision/api.php?action=get_ics_feed_url')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('icsFeedLink').value = data.url;
                });
            break;
    }
}

function closePopup(type) {
    const popup = document.getElementById(`${type}Popup`);
    if (popup) {
        popup.style.display = 'none';
    }
    editingDocumentId = null;
    editingNoteId = null;
    editingLinkId = null;
    editingEventId = null;
    editingStationeryId = null;
}

function updateFileSelection() {
    const selectedFiles = document.querySelectorAll('.file-select:checked');
    const zipBtn = document.getElementById('zipFilesBtn');
    const deleteBtn = document.getElementById('deleteSelectedFilesBtn');
    const contactSheetBtn = document.getElementById('generateContactSheetBtn');
    const hasSelection = selectedFiles.length > 0;

    if (zipBtn) zipBtn.disabled = !hasSelection;
    if (deleteBtn) deleteBtn.disabled = !hasSelection;
    if (contactSheetBtn) contactSheetBtn.disabled = !hasSelection;
}