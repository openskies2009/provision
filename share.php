<?php
$dsn = 'mysql:host=localhost;dbname=peterfri_wp323';
$username = 'peterfri_wp323';
$password = 'p!6(S8V8yT';
try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Provision CMS - Shared Content</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <header class="header">
        <h1>Provision CMS - Shared Content</h1>
    </header>
    <div class="container">
        <main class="main-content">
            <h3>Shared Content</h3>
            <div id="errorMessages" style="color: red; margin-bottom: 10px;"></div>
            <div id="details"></div>
        </main>
    </div>

    <div id="mediaPopup" class="popup">
        <div class="popup-content media-popup">
            <h3 id="mediaTitle"></h3>
            <div id="mediaPlayer"></div>
            <div class="media-controls">
                <button id="prevMediaBtn" class="btn btn-primary">Previous</button>
                <button id="downloadMediaBtn" class="btn btn-primary">Download</button>
                <button id="nextMediaBtn" class="btn btn-primary">Next</button>
                <button id="closeMediaBtn" class="btn btn-secondary">Close</button>
            </div>
            <div id="fileRating" class="file-rating"></div>
            <div id="commentSection" class="comment-section">
                <div class="comment-input" id="commentInput">
                    <textarea id="commentContent" placeholder="Add a comment"></textarea>
                    <input type="number" id="commentTimestamp" placeholder="Timestamp (seconds)" style="display: none;">
                    <button id="saveCommentBtn" class="btn btn-primary">Save Comment</button>
                </div>
                <div class="comment-list">
                    <h4>Comments</h4>
                    <div id="commentList"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="cardMessage" class="card-message"></div>

    <script src="assets/js/core.js"></script>
    <script src="assets/js/media.js"></script>
    <script>
        let currentFileIndex = 0;
        let fileList = [];
        let currentProject = null;

        function loadSharedContent() {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (!token) {
                displayError('No share token provided');
                return;
            }

            fetch(`https://peterfriedlander.tv/provision/api.php?action=get_share_data&token=${token}`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        displayError(data.error);
                        return;
                    }
                    const details = document.getElementById('details');
                    details.innerHTML = `<h2>Viewing ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}: ${data.item.name}</h2>`;

                    if (data.folders && data.folders.length) {
                        data.folders.forEach(folder => {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-folder"></i> <span>${folder.name} (${folder.type})</span>`;
                            div.dataset.id = folder.id;
                            div.dataset.type = 'folder';
                            div.addEventListener('click', () => {
                                loadFolderDetails(folder.id);
                            });
                            details.appendChild(div);
                        });
                    }

                    if (data.files && data.files.length) {
                        if (data.type === 'folder' && data.item.type === 'Gallery') {
                            const galleryDiv = document.createElement('div');
                            galleryDiv.className = 'gallery-grid';
                            fileList = data.files;
                            data.files.forEach((file, index) => {
                                const ext = file.name.split('.').pop().toLowerCase();
                                if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
                                    const img = document.createElement('img');
                                    img.src = file.path;
                                    img.alt = file.name;
                                    img.addEventListener('click', () => {
                                        currentFileIndex = index;
                                        showMediaPlayer(file, index, fileList, data.item.project_id);
                                    });
                                    galleryDiv.appendChild(img);
                                }
                            });
                            details.appendChild(galleryDiv);
                        } else {
                            fileList = data.files;
                            data.files.forEach((file, index) => {
                                const div = document.createElement('div');
                                div.className = 'file-item';
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
                                div.innerHTML = `<i class="fas fa-file"></i> `;
                                div.appendChild(span);
                                div.appendChild(infoDiv);
                                div.addEventListener('click', () => {
                                    currentFileIndex = index;
                                    showMediaPlayer(file, index, fileList, data.item.project_id);
                                });
                                details.appendChild(div);
                            });
                        }
                    }

                    if (data.projects && data.projects.length) {
                        data.projects.forEach(project => {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-file"></i> <span>${project.name}</span>`;
                            div.dataset.id = project.id;
                            div.dataset.type = 'project';
                            div.addEventListener('click', () => {
                                loadProjectDetails(project.id);
                            });
                            details.appendChild(div);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error loading shared content:', error);
                    displayError(`Failed to load shared content: ${error.message}`);
                });
        }

        function loadProjectDetails(projectId) {
            fetch(`https://peterfriedlander.tv/provision/api.php?action=get_project_details&project_id=${projectId}`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        displayError(data.error);
                        return;
                    }
                    currentProject = data.project;
                    const details = document.getElementById('details');
                    details.innerHTML = `<h2>Viewing Project: ${data.project.name}</h2>`;

                    if (data.folders && data.folders.length) {
                        data.folders.forEach(folder => {
                            const div = document.createElement('div');
                            div.className = 'item';
                            div.innerHTML = `<i class="fas fa-folder"></i> <span>${folder.name} (${folder.type})</span>`;
                            div.dataset.id = folder.id;
                            div.dataset.type = 'folder';
                            div.addEventListener('click', () => {
                                loadFolderDetails(folder.id);
                            });
                            details.appendChild(div);
                        });
                    }

                    if (data.files && data.files.length) {
                        fileList = data.files;
                        data.files.forEach((file, index) => {
                            const div = document.createElement('div');
                            div.className = 'file-item';
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
                            div.innerHTML = `<i class="fas fa-file"></i> `;
                            div.appendChild(span);
                            div.appendChild(infoDiv);
                            div.addEventListener('click', () => {
                                currentFileIndex = index;
                                showMediaPlayer(file, index, fileList, projectId);
                            });
                            details.appendChild(div);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error loading project details:', error);
                    displayError(`Failed to load project details: ${error.message}`);
                });
        }

        function loadFolderDetails(folderId) {
            fetch(`https://peterfriedlander.tv/provision/api.php?action=get_folders&id=${folderId}`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    return response.json();
                })
                .then(folder => {
                    if (folder.error) {
                        displayError(folder.error);
                        return;
                    }
                    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_share_data&token=${new URLSearchParams(window.location.search).get('token')}`)
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                            return response.json();
                        })
                        .then(data => {
                            if (data.error) {
                                displayError(data.error);
                                return;
                            }
                            const details = document.getElementById('details');
                            details.innerHTML = `<h2>Viewing Folder: ${folder.name}</h2>`;
                            const folderFiles = data.files.filter(file => file.folder_id === folderId);
                            if (folder.type === 'Gallery') {
                                const galleryDiv = document.createElement('div');
                                galleryDiv.className = 'gallery-grid';
                                fileList = folderFiles;
                                folderFiles.forEach((file, index) => {
                                    const ext = file.name.split('.').pop().toLowerCase();
                                    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
                                        const img = document.createElement('img');
                                        img.src = file.path;
                                        img.alt = file.name;
                                        img.addEventListener('click', () => {
                                            currentFileIndex = index;
                                            showMediaPlayer(file, index, fileList, folder.project_id);
                                        });
                                        galleryDiv.appendChild(img);
                                    }
                                });
                                details.appendChild(galleryDiv);
                            } else {
                                fileList = folderFiles;
                                folderFiles.forEach((file, index) => {
                                    const div = document.createElement('div');
                                    div.className = 'file-item';
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
                                    div.innerHTML = `<i class="fas fa-file"></i> `;
                                    div.appendChild(span);
                                    div.appendChild(infoDiv);
                                    div.addEventListener('click', () => {
                                        currentFileIndex = index;
                                        showMediaPlayer(file, index, fileList, folder.project_id);
                                    });
                                    details.appendChild(div);
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error loading folder details:', error);
                            displayError(`Failed to load folder details: ${error.message}`);
                        });
                })
                .catch(error => {
                    console.error('Error loading folder:', error);
                    displayError(`Failed to load folder: ${error.message}`);
                });
        }

        document.addEventListener('DOMContentLoaded', loadSharedContent);
    </script>
</body>
</html>