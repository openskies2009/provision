let currentMediaIndex = 0;
let currentMediaFiles = [];
let currentProjectId = null;

function showMediaPlayer(file, index, files, projectId) {
    currentMediaIndex = index;
    currentMediaFiles = files;
    currentProjectId = projectId;

    const mediaPopup = document.getElementById('mediaPopup');
    const mediaTitle = document.getElementById('mediaTitle');
    const mediaPlayer = document.getElementById('mediaPlayer');
    const commentList = document.getElementById('commentList');
    const commentContent = document.getElementById('commentContent');
    const commentTimestamp = document.getElementById('commentTimestamp');
    const fileRating = document.getElementById('fileRating');
    const prevMediaBtn = document.getElementById('prevMediaBtn');
    const nextMediaBtn = document.getElementById('nextMediaBtn');
    const downloadMediaBtn = document.getElementById('downloadMediaBtn');

    mediaPopup.style.display = 'flex';
    mediaTitle.textContent = file.name;
    commentContent.value = '';
    commentTimestamp.value = '';
    commentTimestamp.style.display = file.type === 'video' || file.type === 'audio' ? 'block' : 'none';

    // Render media based on file type
    if (file.type === 'image') {
        mediaPlayer.innerHTML = `<img src="${file.url}" alt="${file.name}" />`;
    } else if (file.type === 'video') {
        mediaPlayer.innerHTML = `<video controls><source src="${file.url}" type="video/mp4"></video>`;
    } else if (file.type === 'audio') {
        mediaPlayer.innerHTML = `<audio controls><source src="${file.url}" type="audio/mpeg"></audio>`;
    } else {
        mediaPlayer.innerHTML = `<p>Unsupported media type</p>`;
    }

    // Load comments
    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_comments&file_id=${file.id}`)
        .then(response => response.json())
        .then(comments => {
            commentList.innerHTML = comments.length === 0 ? '<p>No comments yet</p>' : '';
            comments.forEach(comment => {
                const div = document.createElement('div');
                div.className = 'comment';
                div.innerHTML = `
                    <p>${comment.content}</p>
                    <small>Posted on ${new Date(comment.created_at).toLocaleString()}</small>
                    ${comment.timestamp ? `<small class="timestamp" data-timestamp="${comment.timestamp}">Jump to ${comment.timestamp}s</small>` : ''}
                `;
                commentList.appendChild(div);
            });

            // Add timestamp click handlers for video/audio
            document.querySelectorAll('.timestamp').forEach(ts => {
                ts.addEventListener('click', () => {
                    const player = mediaPlayer.querySelector('video, audio');
                    if (player) {
                        player.currentTime = parseInt(ts.dataset.timestamp);
                        player.play();
                    }
                });
            });
        });

    // Load rating
    fetch(`https://peterfriedlander.tv/provision/api.php?action=get_rating&file_id=${file.id}`)
        .then(response => response.json())
        .then(data => {
            fileRating.innerHTML = Array(5).fill(0).map((_, i) => 
                `<i class="fas fa-star ${i < (data.rating || 0) ? 'rated' : ''}" data-rating="${i + 1}"></i>`
            ).join('');
            fileRating.querySelectorAll('.fa-star').forEach(star => {
                star.addEventListener('click', () => {
                    const rating = star.dataset.rating;
                    fetch('https://peterfriedlander.tv/provision/api.php?action=save_rating', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ file_id: file.id, rating })
                    })
                        .then(response => response.json())
                        .then(result => {
                            showCardMessage('Rating updated');
                            showMediaPlayer(file, currentMediaIndex, currentMediaFiles, currentProjectId);
                        });
                });
            });
        });

    // Save comment handler
    document.getElementById('saveCommentBtn').addEventListener('click', () => {
        const content = commentContent.value.trim();
        const timestamp = commentTimestamp.value || null;
        if (!content) {
            displayError('Comment content is required');
            return;
        }
        fetch('https://peterfriedlander.tv/provision/api.php?action=save_comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_id: file.id, content, timestamp })
        })
            .then(response => response.json())
            .then(result => {
                showCardMessage('Comment added');
                showMediaPlayer(file, currentMediaIndex, currentMediaFiles, currentProjectId);
            });
    });

    // Navigation handlers
    prevMediaBtn.disabled = currentMediaIndex === 0;
    nextMediaBtn.disabled = currentMediaIndex === currentMediaFiles.length - 1;
    prevMediaBtn.onclick = () => {
        if (currentMediaIndex > 0) {
            showMediaPlayer(currentMediaFiles[currentMediaIndex - 1], currentMediaIndex - 1, currentMediaFiles, currentProjectId);
        }
    };
    nextMediaBtn.onclick = () => {
        if (currentMediaIndex < currentMediaFiles.length - 1) {
            showMediaPlayer(currentMediaFiles[currentMediaIndex + 1], currentMediaIndex + 1, currentMediaFiles, currentProjectId);
        }
    };

    // Download handler
    downloadMediaBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Close handler
    document.getElementById('closeMediaBtn').onclick = () => {
        mediaPopup.style.display = 'none';
        currentMediaIndex = 0;
        currentMediaFiles = [];
        currentProjectId = null;
    };
}