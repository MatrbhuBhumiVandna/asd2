document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const previewFrame = document.getElementById('preview-frame');
    const runBtn = document.getElementById('run-btn');
    const saveBtn = document.getElementById('save-btn');
    const currentFileDisplay = document.getElementById('current-file');
    const directoryTree = document.getElementById('directory-tree');
    const uploadBtn = document.getElementById('upload-btn');
    
    // Tab bars
    const projectTabBar = document.getElementById('project-tab-bar');
    const folderTabBar = document.getElementById('folder-tab-bar');
    const fileTabBar = document.getElementById('file-tab-bar');
    
    // Add buttons
    const addProjectBtn = document.getElementById('add-project');
    const addFolderBtn = document.getElementById('add-folder');
    const addFileBtn = document.getElementById('add-file');
    
    // Modals
    const newProjectModal = document.getElementById('new-project-modal');
    const newFolderModal = document.getElementById('new-folder-modal');
    const newFileModal = document.getElementById('new-file-modal');
    const uploadModal = document.getElementById('upload-modal');
    const editModal = document.getElementById('edit-modal');
    
    // Modal buttons
    const cancelProjectBtn = document.getElementById('cancel-project');
    const createProjectBtn = document.getElementById('create-project');
    const cancelFolderBtn = document.getElementById('cancel-folder');
    const createFolderBtn = document.getElementById('create-folder');
    const cancelFileBtn = document.getElementById('cancel-file');
    const createFileBtn = document.getElementById('create-file');
    const cancelUploadBtn = document.getElementById('cancel-upload');
    const confirmUploadBtn = document.getElementById('confirm-upload');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const confirmEditBtn = document.getElementById('confirm-edit');
    
    // Upload elements
    const fileUpload = document.getElementById('file-upload');
    const uploadPreview = document.getElementById('upload-preview');
    
    // Edit elements
    const editNameInput = document.getElementById('edit-name');
    
    // State
    let currentProject = 'project-1';
    let currentFolder = 'folder-1';
    let currentFile = 'file-1';
    let editTarget = null;
    
    // Sample data structure
    let projects = {
        'project-1': {
            name: 'My Project',
            folders: {
                'folder-1': {
                    name: 'Main',
                    files: {
                        'file-1': {
                            name: 'index.html',
                            type: 'html',
                            content: `<!DOCTYPE html>
<html>
<head>
    <title>My Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to CodeCraft Pro!</h1>
    <p>This is a powerful real-time code editor.</p>
    <button id="demo-btn">Click Me</button>
    <script src="script.js"></script>
</body>
</html>`
                        },
                        'file-2': {
                            name: 'styles.css',
                            type: 'css',
                            content: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f8f9fa;
    color: #2d3436;
}

h1 {
    color: #6c5ce7;
    margin-bottom: 20px;
}

p {
    color: #636e72;
    line-height: 1.6;
}

#demo-btn {
    background-color: #6c5ce7;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
    transition: all 0.3s;
}

#demo-btn:hover {
    background-color: #5649c0;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}`
                        },
                        'file-3': {
                            name: 'script.js',
                            type: 'js',
                            content: `document.getElementById('demo-btn').addEventListener('click', function() {
    alert('Welcome to CodeCraft Pro!');
    this.textContent = 'Clicked!';
    this.classList.add('pulse');
    
    setTimeout(() => {
        this.textContent = 'Click Me Again';
        this.classList.remove('pulse');
    }, 1500);
});`
                        }
                    }
                }
            }
        }
    };
    
    // Initialize the editor
    function init() {
        renderAll();
        loadFile(currentFile);
        setupEventListeners();
    }
    
    // Render all UI components
    function renderAll() {
        renderProjectTabs();
        renderFolderTabs();
        renderFileTabs();
        renderDirectoryTree();
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Run button
        runBtn.addEventListener('click', updatePreview);
        
        // Save button
        saveBtn.addEventListener('click', saveCurrentFile);
        
        // Editor content change
        editor.addEventListener('input', function() {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(saveCurrentFile, 1000);
        });
        
        // Add buttons
        addProjectBtn.addEventListener('click', () => showModal(newProjectModal));
        addFolderBtn.addEventListener('click', () => {
            if (!currentProject) return;
            showModal(newFolderModal);
        });
        addFileBtn.addEventListener('click', () => {
            if (!currentProject || !currentFolder) return;
            showModal(newFileModal);
        });
        
        // Upload button
        uploadBtn.addEventListener('click', () => {
            if (!currentProject || !currentFolder) return;
            fileUpload.value = '';
            uploadPreview.innerHTML = '';
            showModal(uploadModal);
        });
        
        // File upload handling
        fileUpload.addEventListener('change', handleFileUpload);
        confirmUploadBtn.addEventListener('click', uploadFiles);
        cancelUploadBtn.addEventListener('click', () => hideModal(uploadModal));
        
        // Modal buttons
        createProjectBtn.addEventListener('click', createNewProject);
        cancelProjectBtn.addEventListener('click', () => hideModal(newProjectModal));
        
        createFolderBtn.addEventListener('click', createNewFolder);
        cancelFolderBtn.addEventListener('click', () => hideModal(newFolderModal));
        
        createFileBtn.addEventListener('click', createNewFile);
        cancelFileBtn.addEventListener('click', () => hideModal(newFileModal));
        
        // Edit modal
        confirmEditBtn.addEventListener('click', confirmEdit);
        cancelEditBtn.addEventListener('click', () => hideModal(editModal));
        
        // Close modals when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === newProjectModal) hideModal(newProjectModal);
            if (e.target === newFolderModal) hideModal(newFolderModal);
            if (e.target === newFileModal) hideModal(newFileModal);
            if (e.target === uploadModal) hideModal(uploadModal);
            if (e.target === editModal) hideModal(editModal);
        });
    }
    
    // Handle file upload selection
    function handleFileUpload() {
        uploadPreview.innerHTML = '';
        
        if (fileUpload.files.length > 0) {
            for (let i = 0; i < fileUpload.files.length; i++) {
                const file = fileUpload.files[i];
                const fileExt = file.name.split('.').pop().toLowerCase();
                
                const item = document.createElement('div');
                item.className = 'upload-item';
                
                let iconClass = 'fa-file';
                if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) iconClass = 'fa-image';
                else if (['mp4', 'webm', 'mov'].includes(fileExt)) iconClass = 'fa-video';
                
                item.innerHTML = `
                    <div class="upload-item-icon"><i class="fas ${iconClass}"></i></div>
                    <div class="upload-item-name">${file.name}</div>
                    <div class="upload-item-size">${formatFileSize(file.size)}</div>
                `;
                
                uploadPreview.appendChild(item);
            }
        }
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Upload files
    function uploadFiles() {
        if (fileUpload.files.length === 0) return;
        
        for (let i = 0; i < fileUpload.files.length; i++) {
            const file = fileUpload.files[i];
            const fileName = file.name;
            const fileExt = fileName.split('.').pop().toLowerCase();
            const fileId = 'file-' + Date.now() + i;
            
            let fileType = 'other';
            if (['html', 'css', 'js'].includes(fileExt)) fileType = fileExt;
            else if (['jpg', 'jpeg'].includes(fileExt)) fileType = 'jpg';
            else if (fileExt === 'png') fileType = 'png';
            else if (fileExt === 'mp4') fileType = 'mp4';
            
            const reader = new FileReader();
            reader.onload = function(e) {
                projects[currentProject].folders[currentFolder].files[fileId] = {
                    name: fileName,
                    type: fileType,
                    content: e.target.result,
                    isUploaded: true
                };
                
                if (i === fileUpload.files.length - 1) {
                    hideModal(uploadModal);
                    renderAll();
                }
            };
            
            if (['jpg', 'png', 'mp4'].includes(fileType)) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        }
    }
    
    // Show modal
    function showModal(modal) {
        modal.style.display = 'flex';
    }
    
    // Hide modal
    function hideModal(modal) {
        modal.style.display = 'none';
    }
    
    // Render project tabs
    function renderProjectTabs() {
        // Clear existing tabs except the add button
        while (projectTabBar.firstChild !== addProjectBtn) {
            projectTabBar.removeChild(projectTabBar.firstChild);
        }
        
        // Add tabs for each project
        for (const projectId in projects) {
            const project = projects[projectId];
            const tab = createTab(projectId, project.name, 'fa-folder-open', projectId === currentProject);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    switchProject(projectId);
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteProject(projectId);
            });
            
            projectTabBar.insertBefore(tab, addProjectBtn);
        }
    }
    
    // Render folder tabs
    function renderFolderTabs() {
        // Clear existing tabs except the add button
        while (folderTabBar.firstChild !== addFolderBtn) {
            folderTabBar.removeChild(folderTabBar.firstChild);
        }
        
        const project = projects[currentProject];
        if (!project) return;
        
        // Add tabs for each folder in current project
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            const tab = createTab(folderId, folder.name, 'fa-folder', folderId === currentFolder);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    switchFolder(folderId);
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFolder(folderId);
            });
            
            folderTabBar.insertBefore(tab, addFolderBtn);
        }
    }
    
    // Render file tabs
    function renderFileTabs() {
        // Clear existing tabs except the add button
        while (fileTabBar.firstChild !== addFileBtn) {
            fileTabBar.removeChild(fileTabBar.firstChild);
        }
        
        const folder = getCurrentFolder();
        if (!folder) return;
        
        // Add tabs for each file in current folder
        for (const fileId in folder.files) {
            const file = folder.files[fileId];
            const tab = createTab(fileId, file.name, getFileIconClass(file.type), fileId === currentFile);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    switchFile(fileId);
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFile(fileId);
            });
            
            fileTabBar.insertBefore(tab, addFileBtn);
        }
    }
    
    // Get file icon class
    function getFileIconClass(fileType) {
        switch(fileType) {
            case 'html': return 'fa-file-code file-icon-html';
            case 'css': return 'fa-file-code file-icon-css';
            case 'js': return 'fa-file-code file-icon-js';
            case 'jpg': return 'fa-file-image file-icon-jpg';
            case 'png': return 'fa-file-image file-icon-png';
            case 'mp4': return 'fa-file-video file-icon-mp4';
            default: return 'fa-file';
        }
    }
    
    // Create a tab element
    function createTab(id, name, icon, isActive) {
        const tab = document.createElement('div');
        tab.className = `tab ${isActive ? 'active' : ''}`;
        tab.dataset.id = id;
        tab.innerHTML = `
            <span class="tab-icon"><i class="fas ${icon}"></i></span>
            <span class="tab-label">${name}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        return tab;
    }
    
    // Render directory tree
    function renderDirectoryTree() {
        directoryTree.innerHTML = '';
        
        const ul = document.createElement('ul');
        
        for (const projectId in projects) {
            const project = projects[projectId];
            const projectItem = createTreeItem(
                projectId, 
                project.name, 
                'project-item', 
                'fa-folder-open', 
                projectId === currentProject,
                'project'
            );
            
            const folderUl = document.createElement('ul');
            
            for (const folderId in project.folders) {
                const folder = project.folders[folderId];
                const folderItem = createTreeItem(
                    folderId,
                    folder.name,
                    'folder-item',
                    'fa-folder',
                    folderId === currentFolder && projectId === currentProject,
                    'folder'
                );
                
                const fileUl = document.createElement('ul');
                
                for (const fileId in folder.files) {
                    const file = folder.files[fileId];
                    const fileItem = createTreeItem(
                        fileId,
                        file.name,
                        'file-item',
                        getFileIconClass(file.type),
                        fileId === currentFile && folderId === currentFolder && projectId === currentProject,
                        'file'
                    );
                    
                    fileItem.addEventListener('click', () => {
                        if (projectId !== currentProject) switchProject(projectId);
                        if (folderId !== currentFolder) switchFolder(folderId);
                        switchFile(fileId);
                    });
                    
                    fileUl.appendChild(fileItem);
                }
                
                folderItem.addEventListener('click', (e) => {
                    const isAction = e.target.classList.contains('tree-node-action') || 
                                    e.target.closest('.tree-node-action');
                    
                    if (!isAction) {
                        const isToggle = e.target.classList.contains('toggle') || 
                                        e.target.classList.contains('fa-chevron-down');
                        
                        if (isToggle) {
                            folderItem.classList.toggle('expanded');
                        } else {
                            if (projectId !== currentProject) switchProject(projectId);
                            if (folderId !== currentFolder) switchFolder(folderId);
                        }
                    }
                });
                
                folderItem.appendChild(fileUl);
                folderUl.appendChild(folderItem);
            }
            
            projectItem.addEventListener('click', (e) => {
                const isAction = e.target.classList.contains('tree-node-action') || 
                                e.target.closest('.tree-node-action');
                
                if (!isAction) {
                    const isToggle = e.target.classList.contains('toggle') || 
                                    e.target.classList.contains('fa-chevron-down');
                    
                    if (isToggle) {
                        projectItem.classList.toggle('expanded');
                    } else {
                        if (projectId !== currentProject) switchProject(projectId);
                    }
                }
            });
            
            projectItem.appendChild(folderUl);
            ul.appendChild(projectItem);
        }
        
        directoryTree.appendChild(ul);
    }
    
    // Create a tree item with actions
    function createTreeItem(id, name, type, icon, isActive, itemType) {
        const li = document.createElement('li');
        li.className = `${type} ${isActive ? 'expanded' : ''}`;
        li.dataset.id = id;
        li.dataset.type = itemType;
        
        const node = document.createElement('div');
        node.className = 'tree-node';
        
        if (itemType === 'project' || itemType === 'folder') {
            node.innerHTML = `
                <span class="toggle"><i class="fas fa-chevron-down"></i></span>
                <span class="icon"><i class="fas ${icon}"></i></span>
                <span class="label">${name}</span>
                <div class="tree-node-actions">
                    <button class="tree-node-action edit-btn" title="Rename">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <button class="tree-node-action delete-btn" title="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            node.innerHTML = `
                <span class="icon"><i class="fas ${icon}"></i></span>
                <span class="label">${name}</span>
                <div class="tree-node-actions">
                    <button class="tree-node-action edit-btn" title="Rename">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <button class="tree-node-action delete-btn" title="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            if (isActive) li.classList.add('active');
        }
        
        // Add event listeners for actions
        const editBtn = node.querySelector('.edit-btn');
        const deleteBtn = node.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showEditModal(id, itemType, name);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (itemType === 'project') deleteProject(id);
            else if (itemType === 'folder') deleteFolder(id);
            else if (itemType === 'file') deleteFile(id);
        });
        
        li.appendChild(node);
        return li;
    }
    
    // Show edit modal
    function showEditModal(id, type, currentName) {
        editTarget = { id, type };
        editNameInput.value = currentName;
        showModal(editModal);
    }
    
    // Confirm edit
    function confirmEdit() {
        const newName = editNameInput.value.trim();
        if (!newName || !editTarget) return;
        
        const { id, type } = editTarget;
        
        if (type === 'project') {
            projects[id].name = newName;
        } 
        else if (type === 'folder') {
            projects[currentProject].folders[id].name = newName;
        } 
        else if (type === 'file') {
            const file = projects[currentProject].folders[currentFolder].files[id];
            const ext = file.name.split('.').pop();
            file.name = newName.endsWith(`.${ext}`) ? newName : `${newName}.${ext}`;
        }
        
        hideModal(editModal);
        renderAll();
    }
    
    // Switch project
    function switchProject(projectId) {
        if (projectId === currentProject) return;
        
        currentProject = projectId;
        const project = projects[projectId];
        
        // Set first folder as current
        const folderIds = Object.keys(project.folders);
        if (folderIds.length > 0) {
            currentFolder = folderIds[0];
            
            // Set first file as current
            const fileIds = Object.keys(project.folders[currentFolder].files);
            if (fileIds.length > 0) {
                currentFile = fileIds[0];
            }
        }
        
        renderAll();
        loadFile(currentFile);
    }
    
    // Switch folder
    function switchFolder(folderId) {
        if (folderId === currentFolder) return;
        
        currentFolder = folderId;
        const folder = getCurrentFolder();
        
        // Set first file as current
        const fileIds = Object.keys(folder.files);
        if (fileIds.length > 0) {
            currentFile = fileIds[0];
        }
        
        renderFolderTabs();
        renderFileTabs();
        renderDirectoryTree();
        loadFile(currentFile);
    }
    
    // Switch file
    function switchFile(fileId) {
        if (fileId === currentFile) return;
        
        currentFile = fileId;
        renderFileTabs();
        renderDirectoryTree();
        loadFile(fileId);
    }
    
    // Get current folder
    function getCurrentFolder() {
        return projects[currentProject]?.folders[currentFolder];
    }
    
    // Get current file
    function getCurrentFile() {
        return getCurrentFolder()?.files[currentFile];
    }
    
    // Load file into editor
    function loadFile(fileId) {
        const file = getCurrentFile();
        if (!file) return;
        
        // Only show editor for text files
        if (['html', 'css', 'js'].includes(file.type)) {
            editor.style.display = 'block';
            editor.value = file.content;
        } else {
            editor.style.display = 'none';
        }
        
        currentFileDisplay.textContent = file.name;
        
        // Update preview for media files
        if (['jpg', 'png', 'mp4'].includes(file.type)) {
            updateMediaPreview(file);
        }
    }
    
    // Update preview for media files
    function updateMediaPreview(file) {
        let previewContent = '';
        
        if (file.type === 'jpg' || file.type === 'png') {
            previewContent = `<!DOCTYPE html>
<html>
<head>
    <title>${file.name}</title>
    <style>
        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
        img { max-width: 100%; max-height: 100%; }
    </style>
</head>
<body>
    <img src="${file.content}" alt="${file.name}">
</body>
</html>`;
        } 
        else if (file.type === 'mp4') {
            previewContent = `<!DOCTYPE html>
<html>
<head>
    <title>${file.name}</title>
    <style>
        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
        video { max-width: 100%; max-height: 100%; }
    </style>
</head>
<body>
    <video controls autoplay>
        <source src="${file.content}" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</body>
</html>`;
        }
        
        previewFrame.srcdoc = previewContent;
    }
    
    // Save current file
    function saveCurrentFile() {
        const file = getCurrentFile();
        if (!file) return;
        
        if (['html', 'css', 'js'].includes(file.type)) {
            file.content = editor.value;
        }
        console.log('File saved:', file.name);
    }
    
    // Update preview
    function updatePreview() {
        saveCurrentFile();
        
        const file = getCurrentFile();
        if (!file) return;
        
        // Don't update preview for media files (they show directly)
        if (['jpg', 'png', 'mp4'].includes(file.type)) return;
        
        const project = projects[currentProject];
        if (!project) return;
        
        let html = '';
        let css = '';
        let js = '';
        
        // Collect all files
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            for (const fileId in folder.files) {
                const f = folder.files[fileId];
                if (f.type === 'html') html = f.content;
                else if (f.type === 'css') css = f.content;
                else if (f.type === 'js') js = f.content;
            }
        }
        
        // Combine into a complete HTML document
        const combinedHtml = html.replace('</head>', `<style>${css}</style></head>`)
                               .replace('</body>', `<script>${js}</script></body>`);
        
        // Update preview frame
        previewFrame.srcdoc = combinedHtml;
    }
    
    // Create new project
    function createNewProject() {
        const name = document.getElementById('project-name').value.trim();
        if (!name) return;
        
        const projectId = 'project-' + Date.now();
        const folderId = 'folder-' + Date.now();
        const fileId = 'file-' + Date.now();
        
        projects[projectId] = {
            name: name,
            folders: {
                [folderId]: {
                    name: 'Main',
                    files: {
                        [fileId]: {
                            name: 'index.html',
                            type: 'html',
                            content: `<!DOCTYPE html>
<html>
<head>
    <title>${name}</title>
</head>
<body>
    <h1>${name}</h1>
</body>
</html>`
                        }
                    }
                }
            }
        };
        
        hideModal(newProjectModal);
        switchProject(projectId);
    }
    
    // Create new folder
    function createNewFolder() {
        const name = document.getElementById('folder-name').value.trim();
        if (!name) return;
        
        const folderId = 'folder-' + Date.now();
        const fileId = 'file-' + Date.now();
        
        projects[currentProject].folders[folderId] = {
            name: name,
            files: {
                [fileId]: {
                    name: 'index.html',
                    type: 'html',
                    content: `<!DOCTYPE html>
<html>
<head>
    <title>${name}</title>
</head>
<body>
    <h1>${name}</h1>
</body>
</html>`
                }
            }
        };
        
        hideModal(newFolderModal);
        switchFolder(folderId);
    }
    
    // Create new file
    function createNewFile() {
        const name = document.getElementById('file-name').value.trim();
        const type = document.getElementById('file-type').value;
        if (!name) return;
        
        const extension = type === 'html' ? '.html' : 
                         type === 'css' ? '.css' : 
                         type === 'js' ? '.js' :
                         type === 'jpg' ? '.jpg' :
                         type === 'png' ? '.png' : '.mp4';
        
        const fullName = name.endsWith(extension) ? name : name + extension;
        const fileId = 'file-' + Date.now();
        
        let content = '';
        if (type === 'html') {
            content = `<!DOCTYPE html>
<html>
<head>
    <title>New File</title>
</head>
<body>
    
</body>
</html>`;
        } else if (type === 'css') {
            content = `/* ${fullName} */`;
        } else if (type === 'js') {
            content = `// ${fullName}`;
        }
        
        projects[currentProject].folders[currentFolder].files[fileId] = {
            name: fullName,
            type: type,
            content: content
        };
        
        hideModal(newFileModal);
        switchFile(fileId);
    }
    
    // Delete project
    function deleteProject(projectId) {
        if (Object.keys(projects).length <= 1) {
            alert('You cannot delete the last project');
            return;
        }
        
        if (confirm(`Are you sure you want to delete project "${projects[projectId].name}"?`)) {
            delete projects[projectId];
            const remainingProjectId = Object.keys(projects)[0];
            switchProject(remainingProjectId);
        }
    }
    
    // Delete folder
    function deleteFolder(folderId) {
        const project = projects[currentProject];
        if (Object.keys(project.folders).length <= 1) {
            alert('You cannot delete the last folder');
            return;
        }
        
        if (confirm(`Are you sure you want to delete folder "${project.folders[folderId].name}"?`)) {
            delete project.folders[folderId];
            const remainingFolderId = Object.keys(project.folders)[0];
            switchFolder(remainingFolderId);
        }
    }
    
    // Delete file
    function deleteFile(fileId) {
        const folder = getCurrentFolder();
        if (Object.keys(folder.files).length <= 1) {
            alert('You cannot delete the last file');
            return;
        }
        
        if (confirm(`Are you sure you want to delete file "${folder.files[fileId].name}"?`)) {
            delete folder.files[fileId];
            const remainingFileId = Object.keys(folder.files)[0];
            switchFile(remainingFileId);
        }
    }
    
    // Initialize the editor
    init();
});
