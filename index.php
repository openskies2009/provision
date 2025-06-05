<?php
$dsn = 'mysql:host=localhost;dbname=peterfri_wp323';
$username = 'peterfri_wp323';
$password = 'p!6(S8V8yT';
$pdo = new PDO($dsn, $username, $password);

// Disable browser caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Provision CMS</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <script src="/provision/tinymce/tinymce.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
    <script>
        tinymce.init({
            selector: '#documentContent, #stationeryContent',
            height: 300,
            menubar: false,
            plugins: ['lists', 'link', 'image'],
            toolbar: 'undo redo | bold italic | bullist numlist | link image | keywords',
            content_style: 'body { font-family: Inter, Roboto, Arial, sans-serif; font-size: 13px; }',
            disable_stats: true,
            license_key: 'gpl',
            setup: function(editor) {
                if (editor.id === 'stationeryContent') {
                    editor.ui.registry.addMenuButton('keywords', {
                        text: 'Insert Keyword',
                        fetch: function(callback) {
                            const items = [
                                { type: 'menuitem', text: 'Project Title', onAction: () => editor.insertContent('{project_title}') },
                                { type: 'menuitem', text: 'Client Name', onAction: () => editor.insertContent('{client_name}') },
                                { type: 'menuitem', text: 'Due Date', onAction: () => editor.insertContent('{due_date}') },
                                { type: 'menuitem', text: 'Event List', onAction: () => editor.insertContent('{event_list}') },
                                { type: 'menuitem', text: 'Final Cost', onAction: () => editor.insertContent('{final_cost}') },
                                { type: 'menuitem', text: 'Project List with Costs', onAction: () => editor.insertContent('{project_list_with_costs}') }
                            ];
                            callback(items);
                        }
                    });
                }
            }
        });
    </script>
</head>
<body>
    <header class="header">
        <h1>Provision CMS</h1>
    </header>
    <div class="container">
        <aside class="sidebar">
            <a href="#" id="stationeryPrintoutsLink" class="system-section"><i class="fas fa-file-alt"></i> Stationery Printouts</a>
            <a href="#" id="calendarLink" class="system-section"><i class="fas fa-calendar-alt"></i> Calendar</a>
            <h3 id="sidebarTitle">Clients</h3>
            <button id="addClientBtn" class="btn btn-primary">Add Client</button>
            <button id="backToClientsBtn" class="btn btn-secondary" style="display: none;">Back to Clients</button>
            <ul id="clientList"></ul>
        </aside>
        <main class="main-content">
            <h3>Details</h3>
            <div id="errorMessages" style="color: red; margin-bottom: 10px;"></div>
            <div id="navigationPath" class="navigation-path"></div>
            <div id="fileControls" class="file-controls compact-controls">
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
            </div>
            <div id="details"></div>
        </main>
    </div>

    <div id="clientPopup" class="popup">
        <div class="popup-content">
            <h3 id="clientPopupTitle">Client</h3>
            <input type="text" id="clientName" placeholder="Client Name">
            <div class="actions">
                <button id="saveClientBtn" class="btn btn-primary">Save</button>
                <button id="cancelClientBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="collectionPopup" class="popup">
        <div class="popup-content">
            <h3>Collection</h3>
            <input type="text" id="collectionName" placeholder="Collection Name">
            <div class="actions">
                <button id="saveCollectionBtn" class="btn btn-primary">Save</button>
                <button id="cancelCollectionBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="folderPopup" class="popup">
        <div class="popup-content">
            <h3>Folder</h3>
            <input type="text" id="folderName" placeholder="Folder Name">
            <select id="folderType">
                <option value="Files">Files</option>
                <option value="Gallery">Gallery</option>
            </select>
            <div class="actions">
                <button id="saveFolderBtn" class="btn btn-primary">Save</button>
                <button id="cancelFolderBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="projectPopup" class="popup">
        <div class="popup-content">
            <h3>Project</h3>
            <input type="text" id="projectName" placeholder="Project Name">
            <label><input type="checkbox" id="allowRatings"> Allow Ratings</label>
            <label><input type="checkbox" id="allowComments"> Allow Comments</label>
            <input type="date" id="dueDate" placeholder="Due Date">
            <input type="number" id="finalCost" placeholder="Final Cost" step="0.01">
            <select id="projectStatus">
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
                <option value="Waiting for Feedback">Waiting for Feedback</option>
                <option value="On Hold">On Hold</option>
            </select>
            <div class="actions">
                <button id="saveProjectBtn" class="btn btn-primary">Save</button>
                <button id="cancelProjectBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="documentPopup" class="popup">
        <div class="popup-content document-popup">
            <h3>Document</h3>
            <input type="text" id="documentTitle" placeholder="Document Title">
            <textarea id="documentContent"></textarea>
            <div class="actions">
                <button id="saveDocumentBtn" class="btn btn-primary">Save</button>
                <button id="deleteDocumentBtn" class="btn btn-secondary">Delete</button>
                <button id="cancelDocumentBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="notePopup" class="popup">
        <div class="popup-content">
            <h3>Note</h3>
            <textarea id="noteContent" placeholder="Note"></textarea>
            <div class="actions">
                <button id="saveNoteBtn" class="btn btn-primary">Save</button>
                <button id="deleteNoteBtn" class="btn btn-secondary">Delete</button>
                <button id="cancelNoteBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="filePopup" class="popup">
        <div class="popup-content">
            <h3>Upload Files</h3>
            <input type="file" id="fileInput" multiple>
            <div id="progressContainer"></div>
            <div class="actions">
                <button id="cancelFileBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="deleteFilePopup" class="popup">
        <div class="popup-content">
            <h3>Delete File</h3>
            <p>Are you sure you want to delete this file?</p>
            <input type="hidden" id="deleteFileId">
            <div class="actions">
                <button id="confirmDeleteFileBtn" class="btn btn-primary">Delete</button>
                <button id="cancelDeleteFileBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="renameFilePopup" class="popup">
        <div class="popup-content">
            <h3>Rename File</h3>
            <input type="hidden" id="renameFileId">
            <input type="text" id="renameFileName" placeholder="New file name">
            <div class="actions">
                <button id="saveRenameFileBtn" class="btn btn-primary">Save</button>
                <button id="cancelRenameFileBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="linkPopup" class="popup">
        <div class="popup-content">
            <h3>Link</h3>
            <input type="text" id="linkUrl" placeholder="URL">
            <input type="text" id="linkTitle" placeholder="Link Title">
            <div class="actions">
                <button id="saveLinkBtn" class="btn btn-primary">Save</button>
                <button id="deleteLinkBtn" class="btn btn-secondary">Delete</button>
                <button id="cancelLinkBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="eventPopup" class="popup">
        <div class="popup-content">
            <h3>Event</h3>
            <input type="text" id="eventTitle" placeholder="Event Title">
            <input type="datetime-local" id="eventDateTime" placeholder="Date and Time">
            <textarea id="eventNote" placeholder="Note"></textarea>
            <label><input type="checkbox" id="eventShowOnStationery"> Show on Stationery</label>
            <div class="actions">
                <button id="saveEventBtn" class="btn btn-primary">Save</button>
                <button id="deleteEventBtn" class="btn btn-secondary">Delete</button>
                <button id="cancelEventBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="stationeryPopup" class="popup">
        <div class="popup-content stationery-popup">
            <h3>Stationery Template</h3>
            <input type="text" id="stationeryTitle" placeholder="Template Title">
            <select id="stationeryType">
                <option value="Contract">Contract</option>
                <option value="Letter">Letter</option>
                <option value="Invoice">Invoice</option>
                <option value="Slate">Slate</option>
            </select>
            <select id="stationeryAsset">
                <option value="General">General</option>
                <option value="Project">Project</option>
                <option value="Client">Client</option>
            </select>
            <input type="text" id="stationeryAssetId" placeholder="Project or Client ID (if applicable)" style="display: none;">
            <textarea id="stationeryContent" placeholder="Template Content"></textarea>
            <div class="actions">
                <button id="saveStationeryBtn" class="btn btn-primary">Save</button>
                <button id="deleteStationeryBtn" class="btn btn-secondary">Delete</button>
                <button id="cancelStationeryBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="add-stationeryPopup" class="popup">
        <div class="popup-content">
            <h3>Add Stationery</h3>
            <select id="stationerySelect">
                <option value="">Select Stationery</option>
            </select>
            <div class="actions">
                <button id="saveAddStationeryBtn" class="btn btn-primary">Add</button>
                <button id="cancelAddStationeryBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="deletePopup" class="popup">
        <div class="popup-content">
            <h3 id="deletePopupTitle">Delete Item</h3>
            <p>Are you sure you want to delete this item?</p>
            <input type="hidden" id="deleteItemId">
            <input type="hidden" id="deleteItemType">
            <div class="actions">
                <button id="confirmDeleteBtn" class="btn btn-primary">Delete</button>
                <button id="cancelDeleteBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div id="mediaPopup" class="popup">
        <div class="popup-content media-popup">
            <div class="media-grid">
                <div class="media-title">
                    <i class="fas fa-times close-btn" id="closeMediaBtn"></i>
                    <h3 id="mediaTitle"></h3>
                </div>
                <div class="media-viewer" id="mediaPlayer"></div>
                <div class="media-comments">
                    <div class="comment-list">
                        <h4>Comments</h4>
                        <div id="commentList"></div>
                    </div>
                    <div class="comment-input">
                        <textarea id="commentContent" placeholder="Add a comment"></textarea>
                        <input type="number" id="commentTimestamp" placeholder="Timestamp (seconds)" style="display: none;">
                        <button id="saveCommentBtn" class="btn btn-primary">Save Comment</button>
                    </div>
                </div>
                <div class="media-actions">
                    <button id="prevMediaBtn" class="btn btn-primary">Previous</button>
                    <button id="downloadMediaBtn" class="btn btn-primary">Download</button>
                    <button id="nextMediaBtn" class="btn btn-primary">Next</button>
                    <div id="fileRating" class="file-rating"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="sharePopup" class="popup">
        <div class="popup-content">
            <h3>Share</h3>
            <input type="text" id="shareLink" readonly>
            <button id="copyShareLinkBtn" class="btn btn-primary">Copy Link</button>
            <label class="public-checkbox"><input type="checkbox" id="isPublic"> Public</label>
            <div class="actions">
                <button id="closeShareBtn" class="btn btn-secondary">Close</button>
            </div>
        </div>
    </div>
    <div id="ics-feedPopup" class="popup">
        <div class="popup-content">
            <h3>Subscribe to Calendar</h3>
            <input type="text" id="icsFeedLink" readonly>
            <button id="copyIcsFeedBtn" class="btn btn-primary">Copy Link</button>
            <div class="actions">
                <button id="closeIcsFeedBtn" class="btn btn-secondary">Close</button>
            </div>
        </div>
    </div>
    <div id="cardMessage" class="card-message"></div>

    <script src="assets/js/core.js"></script>
    <script src="assets/js/data.js"></script>
    <script src="assets/js/ui-navigation.js"></script>
    <script src="assets/js/ui-display.js"></script>
    <script src="assets/js/ui-popups.js"></script>
    <script src="assets/js/ui-event-handlers.js"></script>
    <script src="assets/js/media.js"></script>
    <script src="assets/js/share.js"></script>
</body>
</html>