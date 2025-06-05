function loadShareData(token) {
    const details = document.getElementById('details');
    const navigationPath = document.getElementById('navigationPath');
    details.innerHTML = '<p>Loading...</p>';
    navigationPath.innerHTML = '';

    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_share_data&token=${token}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                details.innerHTML = `<p>Error: ${data.error}</p>`;
                return;
            }

            let navPath = '';
            let title = '';
            let content = '';

            switch (data.type) {
                case 'client':
                    title = `Shared Client: ${data.item.name}`;
                    navPath = `<span class="breadcrumb" data-type="client" data-id="${data.item.id}" data-token="${token}">Client: ${data.item.name}</span>`;
                    content += `<div class="actions"></div>`;
                    if (data.projects.length > 0) {
                        content += `<h3>Projects</h3>`;
                        data.projects.forEach(project => {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-file"></i> <span>${project.name}</span>`;
                            div.dataset.id = project.id;
                            div.dataset.type = 'project';
                            div.addEventListener('click', () => generateShareLinkAndNavigate('project', project.id));
                            content += div.outerHTML;
                        });
                    }
                    if (data.folders.length > 0) {
                        content += `<h3>Folders</h3>`;
                        data.folders.forEach(folder => {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-folder"></i> <span>${folder.name}</span>`;
                            div.dataset.id = folder.id;
                            div.dataset.type = 'folder';
                            div.addEventListener('click', () => generateShareLinkAndNavigate('folder', folder.id));
                            content += div.outerHTML;
                        });
                    }
                    if (data.files.length > 0) {
                        content += `<h3>Files</h3>`;
                        data.files.forEach(file => {
                            const div = document.createElement('div');
                            div.className = 'file-item';
                            div.innerHTML = `<i class="fas fa-file"></i> <span class="file-name">${file.name}</span>`;
                            div.dataset.id = file.id;
                            div.dataset.type = 'file';
                            div.addEventListener('click', () => {
                                const index = data.files.findIndex(f => f.id === file.id);
                                showMediaPlayer(file, index, data.files, file.project_id);
                            });
                            content += div.outerHTML;
                        });
                    }
                    break;

                case 'collection':
                    title = `Shared Collection: ${data.item.name}`;
                    navPath = `<span class="breadcrumb" data-type="client" data-id="${data.item.client_id}" data-token="${token}">Client</span> > <span class="breadcrumb" data-type="collection" data-id="${data.item.id}" data-token="${token}">Collection: ${data.item.name}</span>`;
                    content += `<div class="actions"></div>`;
                    if (data.projects.length > 0) {
                        content += `<h3>Projects</h3>`;
                        data.projects.forEach(project => {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-file"></i> <span>${project.name}</span>`;
                            div.dataset.id = project.id;
                            div.dataset.type = 'project';
                            div.addEventListener('click', () => generateShareLinkAndNavigate('project', project.id));
                            content += div.outerHTML;
                        });
                    }
                    if (data.folders.length > 0) {
                        content += `<h3>Folders</h3>`;
                        data.folders.forEach(folder => {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-folder"></i> <span>${folder.name}</span>`;
                            div.dataset.id = folder.id;
                            div.dataset.type = 'folder';
                            div.addEventListener('click', () => generateShareLinkAndNavigate('folder', folder.id));
                            content += div.outerHTML;
                        });
                    }
                    if (data.files.length > 0) {
                        content += `<h3>Files</h3>`;
                        data.files.forEach(file => {
                            const div = document.createElement('div');
                            div.className = 'file-item';
                            div.innerHTML = `<i class="fas fa-file"></i> <span class="file-name">${file.name}</span>`;
                            div.dataset.id = file.id;
                            div.dataset.type = 'file';
                            div.addEventListener('click', () => {
                                const index = data.files.findIndex(f => f.id === file.id);
                                showMediaPlayer(file, index, data.files, file.project_id);
                            });
                            content += div.outerHTML;
                        });
                    }
                    break;

                case 'project':
                    title = `Shared Project: ${data.item.name}`;
                    navPath = `<span class="breadcrumb" data-type="client" data-id="${data.item.client_id}" data-token="${token}">Client</span> > <span class="breadcrumb" data-type="collection" data-id="${data.item.collection_id}" data-token="${token}">Collection</span> > <span class="breadcrumb" data-type="project" data-id="${data.item.id}" data-token="${token}">Project: ${data.item.name}</span>`;
                    content += `<div class="actions"></div>`;
                    if (data.folders.length > 0) {
                        content += `<h3>Folders</h3>`;
                        data.folders.forEach(folder => {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-folder"></i> <span>${folder.name}</span>`;
                            div.dataset.id = folder.id;
                            div.dataset.type = 'folder';
                            div.addEventListener('click', () => generateShareLinkAndNavigate('folder', folder.id));
                            content += div.outerHTML;
                        });
                    }
                    if (data.files.length > 0) {
                        content += `<h3>Files</h3>`;
                        data.files.forEach(file => {
                            const div = document.createElement('div');
                            div.className = 'file-item';
                            div.innerHTML = `<i class="fas fa-file"></i> <span class="file-name">${file.name}</span>`;
                            div.dataset.id = file.id;
                            div.dataset.type = 'file';
                            div.addEventListener('click', () => {
                                const index = data.files.findIndex(f => f.id === file.id);
                                showMediaPlayer(file, index, data.files, file.project_id);
                            });
                            content += div.outerHTML;
                        });
                    }
                    break;

                case 'folder':
                    title = `Shared Folder: ${data.item.name}`;
                    navPath = `<span class="breadcrumb" data-type="client" data-id="${data.item.client_id}" data-token="${token}">Client</span>`;
                    if (data.item.collection_id) {
                        navPath += ` > <span class="breadcrumb" data-type="collection" data-id="${data.item.collection_id}" data-token="${token}">Collection</span>`;
                    }
                    if (data.item.project_id) {
                        navPath += ` > <span class="breadcrumb" data-type="project" data-id="${data.item.project_id}" data-token="${token}">Project</span>`;
                    }
                    navPath += ` > <span class="breadcrumb" data-type="folder" data-id="${data.item.id}" data-token="${token}">Folder: ${data.item.name}</span>`;
                    content += `<div class="actions"></div>`;
                    if (data.files.length > 0) {
                        content += `<h3>Files</h3>`;
                        data.files.forEach(file => {
                            const div = document.createElement('div');
                            div.className = 'file-item';
                            div.innerHTML = `<i class="fas fa-file"></i> <span class="file-name">${file.name}</span>`;
                            div.dataset.id = file.id;
                            div.dataset.type = 'file';
                            div.addEventListener('click', () => {
                                const index = data.files.findIndex(f => f.id === file.id);
                                showMediaPlayer(file, index, data.files, file.project_id);
                            });
                            content += div.outerHTML;
                        });
                    }
                    break;
            }

            document.getElementById('shareTitle').textContent = title;
            navigationPath.innerHTML = navPath;
            details.innerHTML = content;

            document.querySelectorAll('.breadcrumb').forEach(breadcrumb => {
                breadcrumb.addEventListener('click', () => {
                    const type = breadcrumb.dataset.type;
                    const id = breadcrumb.dataset.id;
                    const newToken = breadcrumb.dataset.token;
                    if (type && id && newToken) {
                        loadShareData(newToken);
                    }
                });
            });
        });
}

function generateShareLinkAndNavigate(type, id) {
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
            const newToken = data.token;
            loadShareData(newToken);
        })
        .catch(error => {
            displayError('Failed to generate share link');
        });
}