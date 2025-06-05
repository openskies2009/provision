function loadClients() {
    clearErrors();
    const list = document.getElementById('clientList');
    const sidebarTitle = document.getElementById('sidebarTitle');
    const addClientBtn = document.getElementById('addClientBtn');
    const backToClientsBtn = document.getElementById('backToClientsBtn');
    const fileControls = document.getElementById('fileControls');
    if (fileControls) fileControls.style.display = 'none';
    list.innerHTML = '';
    sidebarTitle.textContent = 'Clients';
    addClientBtn.style.display = 'block';
    backToClientsBtn.style.display = 'none';
    fetch('https://peterfriedlander.tv/provision/api.php?action=get_clients')
        .then(response => response.json())
        .then(clients => {
            clients.forEach(client => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-user"></i> <span>${client.name}</span>`;
                li.dataset.id = client.id;
                li.dataset.type = 'client';
                li.className = currentClientId === client.id ? 'selected' : '';
                li.addEventListener('click', () => {
                    document.querySelectorAll('#clientList li').forEach(item => item.className = '');
                    li.className = 'selected';
                    navigateToClient(client.id);
                });
                list.appendChild(li);
            });
            const details = document.getElementById('details');
            details.innerHTML = `
                <h2><i class="fas fa-star"></i> Favorite Projects</h2>
                <div class="actions">
                    <button class="btn btn-primary action-btn" data-action="add-client">Add Client</button>
                </div>
            `;
            fetch('https://peterfriedlander.tv/provision/api.php?action=get_favorite_projects')
                .then(response => response.json())
                .then(projects => {
                    if (projects.length === 0) {
                        details.innerHTML += '<p>No favorite projects available</p>';
                    } else {
                        const table = document.createElement('table');
                        table.className = 'favorite-projects-table';
                        table.innerHTML = `
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Client</th>
                                    <th>Collection</th>
                                    <th>Files</th>
                                    <th>Status</th>
                                    <th>Last Shared View</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        `;
                        const tbody = table.querySelector('tbody');
                        projects.forEach(project => {
                            const tr = document.createElement('tr');
                            const isCompleted = project.status === 'Completed';
                            tr.innerHTML = `
                                <td class="${isCompleted ? 'completed' : ''}">${project.name}</td>
                                <td class="${isCompleted ? 'completed' : ''}">${project.client_name || 'N/A'}</td>
                                <td class="${isCompleted ? 'completed' : ''}">${project.collection_name || 'N/A'}</td>
                                <td class="${isCompleted ? 'completed' : ''}">${project.file_count}</td>
                                <td class="status-${project.status.toLowerCase().replace(/\s+/g, '-')}" style="color: inherit;">${project.status}</td>
                                <td class="${isCompleted ? 'completed' : ''}">${project.last_shared_view ? new Date(project.last_shared_view).toLocaleString() : 'Never'}</td>
                                <td>
                                    <button class="btn btn-primary btn-compact action-btn" data-action="toggle-favorite" data-project-id="${project.id}" data-is-favorite="1">Unfavorite</button>
                                </td>
                            `;
                            tr.addEventListener('click', (e) => {
                                if (!e.target.closest('.btn') && !e.target.closest('.action-btn')) {
                                    currentProjectId = project.id;
                                    currentClientId = project.client_id;
                                    currentCollectionId = project.collection_id;
                                    navigateToProject(project.id);
                                }
                            });
                            tbody.appendChild(tr);
                        });
                        details.appendChild(table);
                    }
                    document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', handleActionButton));
                });
        });
}

function loadCollections(clientId) {
    clearErrors();
    currentClientId = clientId;
    currentCollectionId = null;
    collectionName = '';
    const list = document.getElementById('clientList');
    const sidebarTitle = document.getElementById('sidebarTitle');
    const addClientBtn = document.getElementById('addClientBtn');
    const backToClientsBtn = document.getElementById('backToClientsBtn');
    const fileControls = document.getElementById('fileControls');
    if (fileControls) fileControls.style.display = 'none';
    list.innerHTML = ''; // Clear the list to prevent duplicates
    sidebarTitle.textContent = `Client: Loading...`;
    addClientBtn.style.display = 'none';
    backToClientsBtn.style.display = 'block';

    // Remove any existing click event listeners to prevent stacking
    const newSidebarTitle = sidebarTitle.cloneNode(true);
    sidebarTitle.parentNode.replaceChild(newSidebarTitle, sidebarTitle);

    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_client&id=${clientId}`)
        .then(response => response.json())
        .then(client => {
            clientName = client.name;
            newSidebarTitle.innerHTML = `<span class="breadcrumb" data-type="client" data-id="${client.id}">Client: ${client.name}</span>`;
            newSidebarTitle.style.cursor = 'pointer';
            newSidebarTitle.addEventListener('click', () => navigateToClient(client.id));

            Promise.all([
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_collections&client_id=${clientId}`).then(res => res.json()),
                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_projects&client_id=${clientId}`).then(res => res.json())
            ]).then(([collections, projects]) => {
                collections.forEach(collection => {
                    const li = document.createElement('li');
                    li.classList.add('collection-item');
                    li.dataset.id = collection.id;
                    li.dataset.type = 'collection';
                    li.innerHTML = `<i class="fas fa-layer-group"></i> <span>${collection.name}</span>`; // Use collection icon
                    const projectList = document.createElement('ul');
                    projectList.className = 'project-list';
                    projectList.style.display = 'none'; // Initially hidden

                    // Filter projects for this collection
                    const collectionProjects = projects.filter(project => project.collection_id == collection.id);
                    collectionProjects.forEach(project => {
                        const projectLi = document.createElement('li');
                        projectLi.classList.add('project-item');
                        projectLi.dataset.id = project.id;
                        projectLi.dataset.type = 'project';
                        projectLi.innerHTML = `<i class="fas fa-file"></i> <span>${project.name}</span>`;
                        projectLi.addEventListener('click', (e) => {
                            e.stopPropagation();
                            currentProjectId = project.id;
                            currentCollectionId = collection.id;
                            navigateToProject(project.id);
                        });
                        projectList.appendChild(projectLi);
                    });

                    // Toggle project list visibility on collection click
                    li.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const isOpen = projectList.style.display === 'block';
                        document.querySelectorAll('.project-list').forEach(pl => pl.style.display = 'none');
                        document.querySelectorAll('.collection-item').forEach(item => item.classList.remove('selected'));
                        if (!isOpen) {
                            projectList.style.display = 'block';
                            li.classList.add('selected');
                            currentCollectionId = collection.id;
                            navigateToCollection(collection.id);
                        } else {
                            currentCollectionId = null;
                            loadCollections(clientId); // Refresh to show client view
                        }
                    });

                    li.appendChild(projectList);
                    list.appendChild(li);
                });

                const details = document.getElementById('details');
                details.innerHTML = `
                    <h2><i class="fas fa-user"></i> Viewing Client: ${client.name}</h2>
                    <div class="actions">
                        <button class="btn btn-primary action-btn" data-action="add-collection">Add Collection</button>
                        <button class="btn btn-primary action-btn" data-action="add-project">Add Project</button>
                        <button class="btn btn-primary action-btn" data-action="edit-client">Edit Client</button>
                        <button class="btn btn-secondary action-btn" data-action="delete-client">Delete Client</button>
                        <button class="btn btn-primary action-btn" data-action="share-client">Share Client</button>
                        <button class="btn btn-primary action-btn" data-action="add-stationery">Add Stationery</button>
                    </div>
                    <div class="navigation-path">
                        <span class="breadcrumb" data-type="client" data-id="${client.id}" data-context="backend">Client: ${client.name}</span>
                    </div>
                `;

                const statusGroups = {
                    'Waiting for Feedback': [],
                    'Running': [],
                    'On Hold': [],
                    'Completed': []
                };
                projects.forEach(project => statusGroups[project.status || 'Running'].push(project));
                statusGroups['Waiting for Feedback'].sort((a, b) => a.name.localeCompare(b.name));
                statusGroups.Running.sort((a, b) => a.name.localeCompare(b.name));
                statusGroups['On Hold'].sort((a, b) => a.name.localeCompare(b.name));
                statusGroups.Completed.sort((a, b) => a.name.localeCompare(b.name));
                for (const status in statusGroups) {
                    if (statusGroups[status].length > 0) {
                        const statusHeader = document.createElement('h3');
                        statusHeader.textContent = `${status} Projects`;
                        details.appendChild(statusHeader);
                        statusGroups[status].forEach(project => {
                            const div = document.createElement('div');
                            div.className = `item status-${project.status.toLowerCase().replace(/\s+/g, '-')}`;
                            div.innerHTML = `<i class="fas fa-file"></i> <span>${project.name}</span>`;
                            div.dataset.id = project.id;
                            div.dataset.type = 'project';
                            div.draggable = true;
                            applyProjectStatusStyles(div, project.status);
                            div.addEventListener('dragstart', e => {
                                e.dataTransfer.setData('text/plain', project.id);
                                div.classList.add('drag-hover');
                            });
                            div.addEventListener('dragend', e => div.classList.remove('drag-hover'));
                            div.addEventListener('click', () => {
                                currentProjectId = project.id;
                                navigateToProject(project.id);
                            });
                            details.appendChild(div);
                        });
                    }
                }

                if (collections.length > 0) {
                    const collectionHeader = document.createElement('h3');
                    collectionHeader.textContent = 'Collections';
                    details.appendChild(collectionHeader);
                    collections.forEach(collection => {
                        const div = document.createElement('div');
                        div.className = 'item';
                        div.innerHTML = `<i class="fas fa-layer-group"></i> <span>${collection.name}</span>`;
                        div.dataset.id = collection.id;
                        div.dataset.type = 'collection';
                        div.addEventListener('dragover', e => {
                            e.preventDefault();
                            e.currentTarget.classList.add('drag-over');
                        });
                        div.addEventListener('dragleave', e => e.currentTarget.classList.remove('drag-over'));
                        div.addEventListener('drop', e => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('drag-over');
                            e.currentTarget.classList.add('drop-animation');
                            setTimeout(() => e.currentTarget.classList.remove('drop-animation'), 300);
                            const projectId = e.dataTransfer.getData('text/plain');
                            updateProjectCollection(projectId, collection.id);
                        });
                        div.addEventListener('click', () => {
                            currentCollectionId = collection.id;
                            navigateToCollection(collection.id);
                        });
                        details.appendChild(div);
                    });
                }

                fetch(`https://peterfriedlander.tv/provision/api.php?action=get_stationeries&asset_type=Client&asset_id=${clientId}`)
                    .then(response => response.json())
                    .then(stationeries => {
                        if (stationeries.length > 0) {
                            const stationeryHeader = document.createElement('h3');
                            stationeryHeader.textContent = 'Stationery';
                            details.appendChild(stationeryHeader);
                            stationeries.forEach(stationery => {
                                const div = document.createElement('div');
                                div.className = 'item';
                                div.innerHTML = `<i class="fas fa-file-alt"></i> <span>${stationery.title}</span>`;
                                div.dataset.id = stationery.id;
                                div.dataset.type = 'stationery';
                                div.addEventListener('click', () => generateStationery(stationery.id));
                                details.appendChild(div);
                            });
                        }
                    });

                document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', handleActionButton));
                document.querySelectorAll('.breadcrumb').forEach(breadcrumb => {
                    breadcrumb.addEventListener('click', () => {
                        const type = breadcrumb.dataset.type;
                        const id = breadcrumb.dataset.id;
                        const context = breadcrumb.dataset.context || 'backend';
                        if (context === 'backend') {
                            if (type === 'client') navigateToClient(id);
                            else if (type === 'collection') navigateToCollection(id);
                            else if (type === 'project') navigateToProject(id);
                        }
                    });
                });
            });
        });
}

function loadCollectionDetails(collectionId) {
    clearErrors();
    const fileControls = document.getElementById('fileControls');
    if (fileControls) fileControls.style.display = 'none';
    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_collection&id=${collectionId}`)
        .then(response => response.json())
        .then(collection => {
            collectionName = collection.name;
            const details = document.getElementById('details');
            details.innerHTML = `
                <h2><i class="fas fa-layer-group"></i> Viewing Collection: ${collection.name}</h2>
                <div class="actions">
                    <button class="btn btn-primary action-btn" data-action="edit-collection">Edit Collection</button>
                    <button class="btn btn-secondary action-btn" data-action="delete-collection">Delete Collection</button>
                    <button class="btn btn-primary action-btn" data-action="add-project">Create Project</button>
                    <button class="btn btn-primary action-btn" data-action="share-collection">Share Collection</button>
                    <button class="btn btn-primary action-btn" data-action="add-stationery">Add Stationery</button>
                </div>
                <div class="navigation-path">
                    <span class="breadcrumb" data-type="client" data-id="${currentClientId}" data-context="backend">Client: ${clientName}</span>
                    <span> > </span>
                    <span class="breadcrumb" data-type="collection" data-id="${collection.id}" data-context="backend">Collection: ${collection.name}</span>
                </div>
            `;
            fetch(`https://peterfriedlander.tv/provision/api.php?action=get_projects&client_id=${currentClientId}`)
                .then(response => response.json())
                .then(projects => {
                    const projectList = document.createElement('div');
                    projectList.innerHTML = `<h3>Projects in ${collection.name}</h3>`;
                    projects.sort((a, b) => {
                        if (a.status === 'Waiting for Feedback' && b.status !== 'Waiting for Feedback') return -1;
                        if (a.status !== 'Waiting for Feedback' && b.status === 'Waiting for Feedback') return 1;
                        if (a.status === 'On Hold' && b.status !== 'On Hold') return 1;
                        if (a.status !== 'On Hold' && b.status === 'On Hold') return -1;
                        return a.name.localeCompare(b.name);
                    });
                    projects.forEach(project => {
                        if (project.collection_id == collectionId && project.status !== 'Completed') {
                            const div = document.createElement('div');
                            div.className = `item status-${project.status.toLowerCase().replace(/\s+/g, '-')}`;
                            div.innerHTML = `<i class="fas fa-file"></i> <span>${project.name}</span>`;
                            div.dataset.id = project.id;
                            div.dataset.type = 'project';
                            div.draggable = true;
                            applyProjectStatusStyles(div, project.status);
                            div.addEventListener('dragstart', e => {
                                e.dataTransfer.setData('text/plain', project.id);
                                div.classList.add('drag-hover');
                            });
                            div.addEventListener('dragend', e => div.classList.remove('drag-hover'));
                            div.addEventListener('click', () => {
                                currentProjectId = project.id;
                                navigateToProject(project.id);
                            });
                            projectList.appendChild(div);
                        }
                    });
                    details.appendChild(projectList);
                    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_stationeries&asset_type=Client&asset_id=${currentClientId}`)
                        .then(response => response.json())
                        .then(stationeries => {
                            if (stationeries.length > 0) {
                                const stationeryHeader = document.createElement('h3');
                                stationeryHeader.textContent = 'Stationery';
                                details.appendChild(stationeryHeader);
                                stationeries.forEach(stationery => {
                                    const div = document.createElement('div');
                                    div.className = 'item';
                                    div.innerHTML = `<i class="fas fa-file-alt"></i> <span>${stationery.title}</span>`;
                                    div.dataset.id = stationery.id;
                                    div.dataset.type = 'stationery';
                                    div.addEventListener('click', () => generateStationery(stationery.id));
                                    details.appendChild(div);
                                });
                            }
                        });
                    document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', handleActionButton));
                    document.querySelectorAll('.breadcrumb').forEach(breadcrumb => {
                        breadcrumb.addEventListener('click', () => {
                            const type = breadcrumb.dataset.type;
                            const id = breadcrumb.dataset.id;
                            const context = breadcrumb.dataset.context || 'backend';
                            if (context === 'backend') {
                                if (type === 'client') navigateToClient(id);
                                else if (type === 'collection') navigateToCollection(id);
                            }
                        });
                    });
                });
        });
}

function loadProjects(clientId) {
    clearErrors();
    const fileControls = document.getElementById('fileControls');
    if (fileControls) fileControls.style.display = 'none';
    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_projects&client_id=${clientId}`)
        .then(response => response.json())
        .then(projects => {
            const details = document.getElementById('details');
            details.innerHTML += `<h4>Projects</h4>`;
            projects.forEach(project => {
                const div = document.createElement('div');
                div.className = `item status-${project.status.toLowerCase().replace(/\s+/g, '-')}`;
                div.innerHTML = `<i class="fas fa-file"></i> <span>${project.name}</span>`;
                div.dataset.id = project.id;
                div.dataset.type = 'project';
                applyProjectStatusStyles(div, project.status);
                div.addEventListener('click', () => {
                    currentProjectId = project.id;
                    navigateToProject(project.id);
                });
                details.appendChild(div);
            });
            details.innerHTML += `
                <div class="actions">
                    <button class="btn btn-primary action-btn" data-action="add-project">Add Project</button>
                </div>
            `;
            document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', handleActionButton));
        });
}

function loadFolderDetails(folderId) {
    clearErrors();
    const fileControls = document.getElementById('fileControls');
    if (fileControls) fileControls.style.display = 'block';
    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_folders&id=${folderId}`)
        .then(response => response.json())
        .then(folder => {
            const details = document.getElementById('details');
            let navPath = `<span class="breadcrumb" data-type="client" data-id="${currentClientId}" data-context="backend">Client: ${clientName}</span>`;
            if (collectionName) navPath += ` <span> > </span> <span class="breadcrumb" data-type="collection" data-id="${currentCollectionId}" data-context="backend">Collection: ${collectionName}</span>`;
            if (projectName) navPath += ` <span> > </span> <span class="breadcrumb" data-type="project" data-id="${currentProjectId}" data-context="backend">Project: ${projectName}</span>`;
            navPath += ` <span> > </span> Folder: ${folder.name}`;
            details.innerHTML = `
                <h2><i class="fas fa-folder"></i> Viewing Folder: ${folder.name}</h2>
                <div class="actions">
                    <button class="btn btn-primary action-btn" data-action="edit-folder">Edit Folder</button>
                    <button class="btn btn-secondary action-btn" data-action="delete-folder">Delete Folder</button>
                    <button class="btn btn-primary action-btn" data-action="share-folder">Share Folder</button>
                </div>
                <div class="navigation-path">${navPath}</div>
            `;
            fetch(`https://peterfriedlander.tv/provision/api.php?action=get_folder_details&folder_id=${folderId}`)
                .then(response => response.json())
                .then(data => {
                    data.files.sort((a, b) => {
                        if (currentSort === 'rating') return (b.rating || 0) - (a.rating || 0);
                        if (currentSort === 'comments') return (b.comment_count || 0) - (a.comment_count || 0);
                        return a.name.localeCompare(b.name);
                    });
                    const fileControlsDiv = document.createElement('div');
                    fileControlsDiv.className = 'file-controls compact-controls';
                    fileControlsDiv.innerHTML = `
                        <select id="sortFiles" class="btn btn-compact">
                            <option value="name">Sort by Name</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="comments">Sort by Comments</option>
                        </select>
                        <button id="selectAllFilesBtn" class="btn btn-compact">Select All</button>
                        <button id="deselectAllFilesBtn" class="btn btn-compact">Deselect All</button>
                        <button id="zipFilesBtn" class="btn btn-compact" disabled>Zip & Download</button>
                        <button id="deleteSelectedFilesBtn" class="btn btn-compact" disabled>Delete Selected</button>
                        <button id="generateContactSheetBtn" class="btn btn-compact" disabled>Contact Sheet</button>
                    `;
                    details.appendChild(fileControlsDiv);
                    document.getElementById('sortFiles').value = currentSort;
                    document.getElementById('sortFiles').addEventListener('change', (e) => {
                        currentSort = e.target.value;
                        loadFolderDetails(folderId);
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
                    data.files.forEach(file => {
                        const div = document.createElement('div');
                        div.className = 'file-item';
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'file-select';
                        checkbox.dataset.id = file.id;
                        checkbox.addEventListener('change', updateFileSelection);
                        const span = document.createElement('span');
                        span.className = 'file-name';
                        span.textContent = file.name;
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'file-info';
                        const ratingSpan = document.createElement('span');
                        ratingSpan.className = 'file-rating-display';
                        ratingSpan.innerHTML = Array(5).fill(0).map((_, i) => 
                            `<i class="fas fa-star ${i < (file.rating || 0) ? 'rated' : ''}"></i>`
                        ).join('');
                        const commentSpan = document.createElement('span');
                        commentSpan.className = 'file-comment-count';
                        commentSpan.innerHTML = `<i class="fas fa-comment"></i> ${file.comment_count || 0}`;
                        infoDiv.appendChild(ratingSpan);
                        infoDiv.appendChild(commentSpan);
                        const renameBtn = document.createElement('button');
                        renameBtn.className = 'btn btn-secondary btn-rename';
                        renameBtn.innerHTML = '<i class="fas fa-edit"></i>';
                        renameBtn.addEventListener('click', () => {
                            document.getElementById('renameFileId').value = file.id;
                            document.getElementById('renameFileName').value = file.name;
                            showPopup('renameFile');
                        });
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'btn btn-secondary btn-delete';
                        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                        deleteBtn.addEventListener('click', () => {
                            document.getElementById('deleteFileId').value = file.id;
                            showPopup('deleteFile');
                        });
                        div.innerHTML = `<i class="fas fa-file"></i>`;
                        div.appendChild(checkbox);
                        div.appendChild(span);
                        div.appendChild(infoDiv);
                        div.appendChild(renameBtn);
                        div.appendChild(deleteBtn);
                        div.dataset.id = file.id;
                        div.dataset.type = 'file';
                        div.draggable = true;
                        div.addEventListener('dragstart', e => {
                            e.dataTransfer.setData('text/plain', `file:${file.id}`);
                            div.classList.add('drag-hover');
                        });
                        div.addEventListener('dragend', e => div.classList.remove('drag-hover'));
                        div.addEventListener('click', (e) => {
                            if (!e.target.classList.contains('btn-delete') && !e.target.classList.contains('fa-trash') &&
                                !e.target.classList.contains('btn-rename') && !e.target.classList.contains('fa-edit') &&
                                !e.target.classList.contains('fa-star') && !e.target.classList.contains('file-select')) {
                                e.preventDefault();
                                const index = data.files.findIndex(f => f.id === file.id);
                                showMediaPlayer(file, index, data.files, folder.project_id);
                            }
                        });
                        details.appendChild(div);
                    });
                    updateFileSelection();
                });
            document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', handleActionButton));
            document.querySelectorAll('.breadcrumb').forEach(breadcrumb => {
                breadcrumb.addEventListener('click', () => {
                    const type = breadcrumb.dataset.type;
                    const id = breadcrumb.dataset.id;
                    const context = breadcrumb.dataset.context || 'backend';
                    if (context === 'backend') {
                        if (type === 'client') navigateToClient(id);
                        else if (type === 'collection') navigateToCollection(id);
                        else if (type === 'project') navigateToProject(id);
                    }
                });
            });
        });
}

function applyProjectStatusStyles(element, status) {
    if (!element) return;
    element.style.color = '';
    element.style.fontStyle = '';
    element.style.order = '0';
    switch (status) {
        case 'Waiting for Feedback':
            element.style.order = '-1';
            break;
        case 'On Hold':
            element.style.fontStyle = 'italic';
            element.style.order = '1';
            break;
        case 'Completed':
            element.style.display = currentCollectionId || currentProjectId ? 'none' : 'block';
            break;
    }
}

function loadProjectDetails(projectId) {
    clearErrors();
    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_project&id=${projectId}`)
        .then(response => response.json())
        .then(project => {
            projectName = project.name;
            fetch(`https://peterfriedlander.tv/provision/api.php?action=get_project_details&project_id=${projectId}`)
                .then(response => response.json())
                .then(data => {
                    const details = document.getElementById('details');
                    let navPath = `<span class="breadcrumb" data-type="client" data-id="${currentClientId}" data-context="backend">Client: ${clientName}</span>`;
                    if (collectionName) navPath += ` <span> > </span> <span class="breadcrumb" data-type="collection" data-id="${currentCollectionId}" data-context="backend">Collection: ${collectionName}</span>`;
                    navPath += ` <span> > </span> <span class="breadcrumb" data-type="project" data-id="${project.id}" data-context="backend">Project: ${project.name}</span>`;
                    details.innerHTML = `
                        <h2>
                            <i class="fas fa-file"></i>
                            <span class="favorite-toggle action-btn" data-action="toggle-favorite" data-project-id="${project.id}" data-is-favorite="${project.is_favorite ? '1' : '0'}">
                                <i class="fas fa-star ${project.is_favorite ? 'favorited' : ''}"></i> ${project.is_favorite ? 'Unfavorite' : 'Favorite'}
                            </span>
                            Viewing Project: ${project.name}
                        </h2>
                        <div class="actions">
                            <button class="btn btn-primary action-btn" data-action="edit-project">Edit Project</button>
                            <button class="btn btn-secondary action-btn" data-action="delete-project">Delete Project</button>
                            <button class="btn btn-primary action-btn" data-action="share-project">Share Project</button>
                            <button class="btn btn-primary action-btn" data-action="view-events">View Events</button>
                            <button class="btn btn-primary action-btn" data-action="add-stationery">Add Stationery</button>
                        </div>
                        <div class="navigation-path">${navPath}</div>
                        <p>Due Date: ${project.due_date || 'Not set'}</p>
                        <p>Final Cost: ${project.final_cost ? '$' + project.final_cost : 'Not set'}</p>
                        <p class="status-${project.status.toLowerCase().replace(/\s+/g, '-')}" style="color: inherit;">Status: 
                            <select id="projectStatusSelect" class="btn btn-compact">
                                <option value="Running" ${project.status === 'Running' ? 'selected' : ''}>Running</option>
                                <option value="Completed" ${project.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Waiting for Feedback" ${project.status === 'Waiting for Feedback' ? 'selected' : ''}>Waiting for Feedback</option>
                                <option value="On Hold" ${project.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                            </select>
                        </p>
                        <div class="asset-controls compact-controls">
                            <button class="btn btn-blue action-btn" data-action="add-document">Add Document</button>
                            <button class="btn btn-blue action-btn" data-action="add-note">Add Note</button>
                            <button class="btn btn-blue action-btn" data-action="add-files">Upload Files</button>
                            <button class="btn btn-blue action-btn" data-action="add-link">Add Link</button>
                            <button class="btn btn-blue action-btn" data-action="add-folder">Add Folder</button>
                        </div>
                    `;
                    document.getElementById('projectStatusSelect').addEventListener('change', (e) => {
                        const newStatus = e.target.value;
                        fetch(`https://peterfriedlander.tv/provision/api.php?action=update_project`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: projectId,
                                name: project.name,
                                client_id: project.client_id,
                                collection_id: project.collection_id,
                                folder_id: project.folder_id,
                                allow_ratings: project.allow_ratings,
                                allow_comments: project.allow_comments,
                                due_date: project.due_date,
                                final_cost: project.final_cost,
                                status: newStatus
                            })
                        })
                            .then(response => response.json())
                            .then(result => {
                                showCardMessage('Project status updated');
                                loadProjectDetails(projectId);
                            });
                    });
                    const fileControlsDiv = document.createElement('div');
                    fileControlsDiv.className = 'file-controls compact-controls';
                    fileControlsDiv.innerHTML = `
                        <select id="sortFiles" class="btn btn-compact">
                            <option value="name">Sort by Name</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="comments">Sort by Comments</option>
                        </select>
                        <button id="selectAllFilesBtn" class="btn btn-compact">Select All</button>
                        <button id="deselectAllFilesBtn" class="btn btn-compact">Deselect All</button>
                        <button id="zipFilesBtn" class="btn btn-compact" disabled>Zip & Download</button>
                        <button id="deleteSelectedFilesBtn" class="btn btn-compact" disabled>Delete Selected</button>
                        <button id="generateContactSheetBtn" class="btn btn-compact" disabled>Contact Sheet</button>
                    `;
                    details.appendChild(fileControlsDiv);
                    document.getElementById('sortFiles').value = currentSort;
                    document.getElementById('sortFiles').addEventListener('change', (e) => {
                        currentSort = e.target.value;
                        loadProjectDetails(projectId);
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
                    data.folders.forEach(folder => {
                        const div = document.createElement('div');
                        div.className = 'item';
                        div.innerHTML = `<i class="fas fa-folder"></i> <span>${folder.name}</span>`;
                        div.dataset.id = folder.id;
                        div.dataset.type = 'folder';
                        div.addEventListener('dragover', e => {
                            e.preventDefault();
                            e.currentTarget.classList.add('drag-over');
                        });
                        div.addEventListener('dragleave', e => e.currentTarget.classList.remove('drag-over'));
                        div.addEventListener('drop', e => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('drag-over');
                            e.currentTarget.classList.add('drop-animation');
                            setTimeout(() => e.currentTarget.classList.remove('drop-animation'), 300);
                            const data = e.dataTransfer.getData('text/plain').split(':');
                            const type = data[0];
                            const itemId = data[1];
                            updateItemFolder(type, itemId, folder.id);
                        });
                        div.addEventListener('click', () => {
                            currentFolderId = folder.id;
                            loadFolderDetails(folder.id);
                        });
                        details.appendChild(div);
                    });
                    data.documents.forEach(doc => {
                        if (!doc.folder_id) {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-file-alt"></i> <span>${doc.title}</span>`;
                            div.dataset.id = doc.id;
                            div.dataset.type = 'document';
                            div.draggable = true;
                            div.addEventListener('dragstart', e => {
                                e.dataTransfer.setData('text/plain', `document:${doc.id}`);
                                div.classList.add('drag-hover');
                            });
                            div.addEventListener('dragend', () => div.classList.remove('drag-hover'));
                            div.addEventListener('click', () => showPopup('document', doc.id));
                            details.appendChild(div);
                        }
                    });
                    data.notes.forEach(note => {
                        if (!note.folder_id) {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-sticky-note"></i> <span>${note.content}</span>`;
                            div.dataset.id = note.id;
                            div.dataset.type = 'note';
                            div.draggable = true;
                            div.addEventListener('dragstart', e => {
                                e.dataTransfer.setData('text/plain', `note:${note.id}`);
                                div.classList.add('drag-hover');
                            });
                            div.addEventListener('dragend', () => div.classList.remove('drag-hover'));
                            div.addEventListener('click', () => showPopup('note', note.id));
                            details.appendChild(div);
                        }
                    });
                    data.files.forEach(file => {
                        if (!file.folder_id) {
                            const div = document.createElement('div');
                            div.className = 'file-item';
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.className = 'file-select';
                            checkbox.dataset.id = file.id;
                            checkbox.addEventListener('change', updateFileSelection);
                            const span = document.createElement('span');
                            span.className = 'file-name';
                            span.textContent = file.name;
                            const infoDiv = document.createElement('div');
                            infoDiv.className = 'file-info';
                            const ratingSpan = document.createElement('span');
                            ratingSpan.className = 'file-rating-display';
                            ratingSpan.innerHTML = Array(5).fill(0).map((_, i) => 
                                `<i class="fas fa-star ${i < (file.rating || 0) ? 'rated' : ''}"></i>`
                            ).join('');
                            const commentSpan = document.createElement('span');
                            commentSpan.className = 'file-comment-count';
                            commentSpan.innerHTML = `<i class="fas fa-comment"></i> ${file.comment_count || 0}`;
                            infoDiv.appendChild(ratingSpan);
                            infoDiv.appendChild(commentSpan);
                            const renameBtn = document.createElement('button');
                            renameBtn.className = 'btn btn-secondary btn-rename';
                            renameBtn.innerHTML = '<i class="fas fa-edit"></i>';
                            renameBtn.addEventListener('click', () => {
                                document.getElementById('renameFileId').value = file.id;
                                document.getElementById('renameFileName').value = file.name;
                                showPopup('renameFile');
                            });
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = 'btn btn-secondary btn-delete';
                            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                            deleteBtn.addEventListener('click', () => {
                                document.getElementById('deleteFileId').value = file.id;
                                showPopup('deleteFile');
                            });
                            div.innerHTML = `<i class="fas fa-file"></i>`;
                            div.appendChild(checkbox);
                            div.appendChild(span);
                            div.appendChild(infoDiv);
                            div.appendChild(renameBtn);
                            div.appendChild(deleteBtn);
                            div.dataset.id = file.id;
                            div.dataset.type = 'file';
                            div.draggable = true;
                            div.addEventListener('dragstart', e => {
                                e.dataTransfer.setData('text/plain', `file:${file.id}`);
                                div.classList.add('drag-hover');
                            });
                            div.addEventListener('dragend', e => div.classList.remove('drag-hover'));
                            div.addEventListener('click', (e) => {
                                if (!e.target.classList.contains('btn-delete') && !e.target.classList.contains('fa-trash') &&
                                    !e.target.classList.contains('btn-rename') && !e.target.classList.contains('fa-edit') &&
                                    !e.target.classList.contains('fa-star') && !e.target.classList.contains('file-select')) {
                                    e.preventDefault();
                                    const index = data.files.findIndex(f => f.id === file.id);
                                    showMediaPlayer(file, index, data.files, project.id);
                                }
                            });
                            details.appendChild(div);
                        }
                    });
                    data.links.forEach(link => {
                        if (!link.folder_id) {
                            const div = document.createElement('div');
                            div.className = 'item';
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.textContent = link.title;
                            div.innerHTML = `<i class="fas fa-link"></i>`;
                            div.appendChild(a);
                            div.dataset.id = link.id;
                            div.dataset.type = 'link';
                            div.draggable = true;
                            div.addEventListener('dragstart', e => {
                                e.dataTransfer.setData('text/plain', `link:${link.id}`);
                                div.classList.add('drag-hover');
                            });
                            div.addEventListener('dragend', e => div.classList.remove('drag-hover'));
                            div.addEventListener('click', (e) => {
                                if (e.target.tagName !== 'A') showPopup('link', link.id);
                            });
                            details.appendChild(div);
                        }
                    });
                    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_stationeries&asset_type=Project&asset_id=${projectId}`)
                        .then(response => response.json())
                        .then(stationeries => {
                            if (stationeries.length > 0) {
                                const stationeryHeader = document.createElement('h3');
                                stationeryHeader.textContent = 'Stationery';
                                details.appendChild(stationeryHeader);
                                stationeries.forEach(stationery => {
                                    const div = document.createElement('div');
                                    div.className = 'item';
                                    div.innerHTML = `<i class="fas fa-file-alt"></i> <span>${stationery.title}</span>`;
                                    div.dataset.id = stationery.id;
                                    div.dataset.type = 'stationery';
                                    div.addEventListener('click', () => generateStationery(stationery.id));
                                    details.appendChild(div);
                                });
                            }
                        });
                    document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', handleActionButton));
                    document.querySelectorAll('.breadcrumb').forEach(breadcrumb => {
                        breadcrumb.addEventListener('click', () => {
                            const type = breadcrumb.dataset.type;
                            const id = breadcrumb.dataset.id;
                            const context = breadcrumb.dataset.context || 'backend';
                            if (context === 'backend') {
                                if (type === 'client') navigateToClient(id);
                                else if (type === 'collection') navigateToCollection(id);
                                else if (type === 'project') navigateToProject(id);
                            }
                        });
                    });
                    updateFileSelection();
                });
        });
}

function loadEventDetails(projectId) {
    clearErrors();
    const fileControls = document.getElementById('fileControls');
    if (fileControls) fileControls.style.display = 'none';
    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_project&id=${projectId}`)
        .then(response => response.json())
        .then(project => {
            projectName = project.name;
            fetch(`https://peterfriedlander.tv/provision/api.php?action=get_events&project_id=${projectId}`)
                .then(response => response.json())
                .then(events => {
                    const details = document.getElementById('details');
                    let navPath = `<span class="breadcrumb" data-type="client" data-id="${currentClientId}" data-context="backend">Client: ${clientName}</span>`;
                    if (collectionName) navPath += ` <span> > </span> <span class="breadcrumb" data-type="collection" data-id="${currentCollectionId}" data-context="backend">Collection: ${collectionName}</span>`;
                    navPath += ` <span> > </span> <span class="breadcrumb" data-type="project" data-id="${project.id}" data-context="backend">Project: ${project.name}</span>`;
                    navPath += ` <span> > </span> Events`;
                    details.innerHTML = `
                        <h2><i class="fas fa-calendar"></i> Events for ${project.name}</h2>
                        <div class="actions">
                            <button class="btn btn-primary action-btn" data-action="add-event">Add Event</button>
                            <button class="btn btn-primary" onclick="navigateToProject(${projectId})">Back to Project</button>
                        </div>
                        <div class="navigation-path">${navPath}</div>
                    `;
                    events.forEach(event => {
                        const div = document.createElement('div');
                        div.className = 'item';
                        div.innerHTML = `<i class="fas fa-calendar-day"></i> <span>${event.title} (${event.datetime})</span>`;
                        div.dataset.id = event.id;
                        div.dataset.type = 'event';
                        div.addEventListener('click', () => showPopup('event', event.id));
                        details.appendChild(div);
                    });
                    document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', handleActionButton));
                    document.querySelectorAll('.breadcrumb').forEach(breadcrumb => {
                        breadcrumb.addEventListener('click', () => {
                            const type = breadcrumb.dataset.type;
                            const id = breadcrumb.dataset.id;
                            const context = breadcrumb.dataset.context || 'backend';
                            if (context === 'backend') {
                                if (type === 'client') navigateToClient(id);
                                else if (type === 'collection') navigateToCollection(id);
                                else if (type === 'project') navigateToProject(id);
                            }
                        });
                    });
                });
        });
}

function loadCalendar() {
    clearErrors();
    const fileControls = document.getElementById('fileControls');
    if (fileControls) fileControls.style.display = 'none';
    fetch('https://peterfriedlander.tv/provision/api.php?action=get_events')
        .then(response => response.json())
        .then(events => {
            const details = document.getElementById('details');
            details.innerHTML = `
                <h2><i class="fas fa-calendar-alt"></i> Event Calendar</h2>
                <div class="actions">
                    <button class="btn btn-primary action-btn" data-action="show-ics-feed">Subscribe to Calendar</button>
                </div>
                <div id="calendar"></div>
            `;
            const calendarEl = document.getElementById('calendar');
            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                events: events.map(event => ({
                    title: event.title,
                    start: event.datetime,
                    extendedProps: {
                        note: event.note,
                        project_id: event.project_id
                    }
                })),
                eventClick: function(info) {
                    showPopup('event', info.event.extendedProps.id);
                }
            });
            calendar.render();
            document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', handleActionButton));
        });
}

function loadStationeryPrintouts() {
    clearErrors();
    const fileControls = document.getElementById('fileControls');
    if (fileControls) fileControls.style.display = 'none';
    const details = document.getElementById('details');
    details.innerHTML = `
        <h2><i class="fas fa-file-alt"></i> Stationery Printouts</h2>
        <div class="actions">
            <button class="btn btn-primary action-btn" data-action="add-stationery">Create Template</button>
        </div>
    `;
    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_all_stationeries`)
        .then(response => response.json())
        .then(stationeries => {
            const list = document.createElement('div');
            stationeries.forEach(stationery => {
                const div = document.createElement('div');
                div.className = 'item';
                div.innerHTML = `<i class="fas fa-file-alt"></i> <span>${stationery.title}</span>`;
                div.dataset.id = stationery.id;
                div.dataset.type = 'stationery';
                div.addEventListener('click', () => showPopup('stationery', stationery.id));
                list.appendChild(div);
            });
            details.appendChild(list);
            document.querySelectorAll('.action-btn').forEach(button => {
                if (button.dataset.action === 'add-stationery') {
                    button.addEventListener('click', () => showPopup('stationery'));
                } else {
                    button.addEventListener('click', handleActionButton);
                }
            });
        });
}

function generateStationery(stationeryId) {
    clearErrors();
    fetch(`https://peterfriedlander.tv/provision/api.php?action=generate_stationery&id=${stationeryId}`)
        .then(response => response.json())
        .then(data => {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(data.html);
            newWindow.document.close();
        });
}