document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Compress.js loaded at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const chooseFilesBtn = uploadArea.querySelector('button');
    const fileList = document.getElementById('file-list');
    const filesContainer = document.getElementById('files-container');
    const compressionSettings = document.getElementById('compression-settings');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const compressBtn = document.getElementById('compress-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewBtn = document.getElementById('preview-btn');
    const fileStatusIndicator = document.getElementById('file-status-indicator');
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusSubtitle = document.getElementById('status-subtitle');
    const statusAction = document.getElementById('status-action');
    const progressSection = document.getElementById('progress-section');
    const overallProgressBar = document.getElementById('overall-progress-bar');
    const overallProgressText = document.getElementById('overall-progress-text');
    const fileProgress = document.getElementById('file-progress');
    const resultsSection = document.getElementById('results-section');
    const totalReduction = document.getElementById('total-reduction');
    const originalSize = document.getElementById('original-size');
    const compressedSize = document.getElementById('compressed-size');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const compressMoreBtn = document.getElementById('compress-more-btn');
    const downloadLinks = document.getElementById('download-links');
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedOptions = document.getElementById('advanced-options');
    const preserveMetadata = document.getElementById('preserve-metadata');
    const optimizeWeb = document.getElementById('optimize-web');
    const progressiveJpeg = document.getElementById('progressive-jpeg');

    // State
    let selectedFiles = [];
    let compressedFiles = [];
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let isProcessing = false;

    // Verify DOM Elements
    if (!fileInput || !uploadArea || !chooseFilesBtn) {
        showNotification('❌ File input, upload area, or choose files button not found. Check compress.html structure.', 'error');
        console.error('DOM elements missing:', { fileInput: !!fileInput, uploadArea: !!uploadArea, chooseFilesBtn: !!chooseFilesBtn });
        return;
    }
    console.log('✅ DOM elements found:', { 
        fileInput: !!fileInput, 
        uploadArea: !!uploadArea, 
        chooseFilesBtn: !!chooseFilesBtn,
        buttonText: chooseFilesBtn.textContent.trim()
    });

    // Ensure file input is enabled
    fileInput.disabled = false;
    fileInput.classList.remove('pointer-events-none');
    console.log('File input initial state:', { 
        disabled: fileInput.disabled, 
        hidden: fileInput.classList.contains('opacity-0'), 
        accept: fileInput.accept,
        zIndex: window.getComputedStyle(fileInput).zIndex,
        pointerEvents: window.getComputedStyle(fileInput).pointerEvents
    });

    // Library Check
    if (!window.Compressor || !window.PDFLib || !window.JSZip) {
        showNotification('❌ Libraries failed to load (Compressor.js, PDFLib, or JSZip). Check CDN and refresh.', 'error');
        console.error('Library load status:', {
            Compressor: !!window.Compressor,
            PDFLib: !!window.PDFLib,
            JSZip: !!window.JSZip
        });
        return;
    }
    console.log('✅ Libraries loaded: Compressor.js, PDFLib, JSZip');

    // Choose Files Button
    chooseFilesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        chooseFilesBtn.classList.add('bg-primary-700');
        setTimeout(() => chooseFilesBtn.classList.remove('bg-primary-700'), 200);
        console.log('Choose Files button clicked', { 
            isProcessing, 
            fileInputDisabled: fileInput.disabled, 
            buttonClasses: chooseFilesBtn.className,
            zIndex: window.getComputedStyle(fileInput).zIndex,
            pointerEvents: window.getComputedStyle(fileInput).pointerEvents
        });
        if (!isProcessing && !fileInput.disabled) {
            try {
                fileInput.click();
                console.log('Triggering file input dialog');
            } catch (err) {
                console.error('Error triggering file input:', err);
                showNotification('❌ Failed to open file dialog. Try dragging files or check browser settings.', 'error');
            }
        } else {
            console.log('Trigger blocked:', { isProcessing, fileInputDisabled: fileInput.disabled });
            showNotification('⚠️ Cannot select files while compression is in progress or input is disabled', 'error');
        }
    });

    // Upload Area Click
    uploadArea.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isProcessing && !chooseFilesBtn.contains(e.target)) {
            console.log('Upload area clicked', { 
                target: e.target.tagName, 
                id: e.target.id, 
                classes: e.target.className, 
                isProcessing, 
                fileInputDisabled: fileInput.disabled 
            });
            try {
                fileInput.click();
                console.log('Triggering file input dialog from upload area');
            } catch (err) {
                console.error('Error triggering file input from upload area:', err);
                showNotification('❌ Failed to open file dialog. Try dragging files or check browser settings.', 'error');
            }
        }
    });

    // File Input Change
    fileInput.addEventListener('change', (e) => {
        console.log('File input change event triggered', e.target.files.length, 'files');
        handleFiles(e.target.files);
        e.target.value = ''; // Reset input
        fileInput.disabled = false;
        console.log('File input after change:', { disabled: fileInput.disabled, value: e.target.value });
    });

    // Drag-and-Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isProcessing) {
            uploadArea.querySelector('div').classList.add('border-primary-400', 'bg-primary-50', 'dark:bg-primary-900/10');
            console.log('Dragover event on upload area');
        }
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.querySelector('div').classList.remove('border-primary-400', 'bg-primary-50', 'dark:bg-primary-900/10');
        console.log('Dragleave event on upload area');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Drop event triggered', e.dataTransfer.files.length, 'files');
        uploadArea.querySelector('div').classList.remove('border-primary-400', 'bg-primary-50', 'dark:bg-primary-900/10');
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        if (isProcessing) {
            showNotification('⚠️ Cannot select files while compression is in progress', 'error');
            console.log('File selection blocked: isProcessing = true');
            return;
        }
        console.log('Handling files:', Array.from(files).map(f => ({ name: f.name, type: f.type, size: f.size })));

        let validFilesCount = 0;
        Array.from(files).forEach((file) => {
            if (!isValidFile(file)) {
                showNotification(`❌ ${file.name}: Invalid file type or size (>100MB or empty). Type: ${file.type}, Size: ${formatFileSize(file.size)}`, 'error');
                console.warn(`Rejected file: ${file.name}, Type: ${file.type}, Size: ${file.size}`);
                return;
            }
            selectedFiles.push(file);
            totalOriginalSize += file.size;
            validFilesCount++;
        });

        if (validFilesCount > 0) {
            fileList.classList.remove('hidden');
            compressionSettings.classList.remove('hidden');
            compressBtn.disabled = false;
            previewBtn.classList.remove('hidden');
            fileStatusIndicator.classList.remove('hidden');
            displayFiles();
            updateFileStatus('success', `${validFilesCount} File${validFilesCount > 1 ? 's' : ''} Selected`, `Ready to compress ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`, 'Preview');
            showNotification(`✅ ${validFilesCount} file(s) added. Total: ${selectedFiles.length} file(s)`, 'success');
        } else if (selectedFiles.length === 0) {
            showNotification('⚠️ No valid files selected', 'error');
            fileList.classList.add('hidden');
            compressionSettings.classList.add('hidden');
            compressBtn.disabled = true;
            previewBtn.classList.add('hidden');
            fileStatusIndicator.classList.add('hidden');
        }
    }

    function isValidFile(file) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 100 * 1024 * 1024;
        const isValid = allowedTypes.includes(file.type) && file.size <= maxSize && file.size > 0;
        console.log(`Validating file: ${file.name}, Type: ${file.type}, Size: ${file.size}, Valid: ${isValid}`);
        return isValid;
    }

    function displayFiles() {
        filesContainer.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg';
            fileItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9l-7-7H7a2 2 0 00-2 2v16a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-sm truncate max-w-xs">${file.name}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-neutral-500">${formatFileSize(file.size)}</span>
                    <button class="remove-file text-red-500 hover:text-red-700" data-index="${index}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            filesContainer.appendChild(fileItem);
        });

        document.querySelectorAll('.remove-file').forEach((btn) => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                totalOriginalSize -= selectedFiles[index].size;
                selectedFiles.splice(index, 1);
                displayFiles();
                if (selectedFiles.length === 0) {
                    fileList.classList.add('hidden');
                    compressionSettings.classList.add('hidden');
                    compressBtn.disabled = true;
                    previewBtn.classList.add('hidden');
                    fileStatusIndicator.classList.add('hidden');
                } else {
                    updateFileStatus('success', `${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''} Selected`, `Ready to compress ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`, 'Preview');
                }
            });
        });
    }

    // Preview Button
    previewBtn?.addEventListener('click', () => {
        if (selectedFiles.length === 0) {
            showNotification('⚠️ No files selected for preview', 'error');
            return;
        }
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <html>
                <head>
                    <title>File Preview</title>
                    <style>
                        body { font-family: Inter, sans-serif; padding: 20px; background: #f5f5f5; }
                        h1 { font-size: 24px; margin-bottom: 20px; }
                        .file-list { display: grid; gap: 20px; }
                        .file-item { border: 1px solid #ddd; padding: 10px; border-radius: 8px; }
                        img { max-width: 200px; max-height: 200px; object-fit: contain; }
                        p { color: #666; }
                    </style>
                </head>
                <body>
                    <h1>Selected Files Preview</h1>
                    <div class="file-list">
                        ${selectedFiles.map(file => `
                            <div class="file-item">
                                <p>${file.name} (${formatFileSize(file.size)})</p>
                                ${file.type.startsWith('image/') ? `<img src="${URL.createObjectURL(file)}" alt="${file.name}" onload="URL.revokeObjectURL(this.src)" />` : 
                                  file.type === 'application/pdf' ? '<p>PDF Preview not available</p>' : '<p>Preview not supported</p>'}
                            </div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `);
        showNotification('✅ Preview opened in new tab', 'success');
    });

    // File Status Indicator
    function updateFileStatus(status, title, subtitle, action) {
        fileStatusIndicator.classList.remove('hidden');
        statusIcon.innerHTML = status === 'success' ? 
            `<svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` :
            `<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
        statusTitle.textContent = title;
        statusSubtitle.textContent = subtitle;
        statusAction.innerHTML = action ? `<button class="text-primary-600 hover:text-primary-700">${action}</button>` : '';
        if (action === 'Preview') {
            statusAction.querySelector('button').addEventListener('click', () => previewBtn.click());
        } else if (action === 'Choose Files') {
            statusAction.querySelector('button')?.addEventListener('click', () => {
                if (!isProcessing && !fileInput.disabled) {
                    try {
                        fileInput.click();
                        console.log('Triggering file input dialog from status action');
                    } catch (err) {
                        console.error('Error triggering file input from status action:', err);
                        showNotification('❌ Failed to open file dialog. Try dragging files or check browser settings.', 'error');
                    }
                } else {
                    showNotification('⚠️ Cannot select files while compression is in progress or input is disabled', 'error');
                }
            });
        }
    }

    // Compress Button
    compressBtn?.addEventListener('click', async () => {
        if (!selectedFiles.length || isProcessing) return;
        isProcessing = true;
        updateFileStatus('success', 'Compressing Files', 'Processing in progress...', '');
        uploadArea.classList.add('hidden');
        fileList.classList.add('hidden');
        compressionSettings.classList.add('hidden');
        previewBtn.classList.add('hidden');
        fileStatusIndicator.classList.add('hidden');
        progressSection.classList.remove('hidden');
        compressBtn.disabled = true;
        compressedFiles = [];
        totalCompressedSize = 0;
        fileProgress.innerHTML = '';

        const quality = parseInt(qualitySlider.value) / 100;
        const mode = document.querySelector('input[name="compression-mode"]:checked')?.value || 'balanced';
        const preserveMeta = preserveMetadata.checked;
        const webOptimized = optimizeWeb.checked;
        const progressive = progressiveJpeg.checked;

        console.log('Compression settings:', { quality, mode, preserveMeta, webOptimized, progressive });

        let completed = 0;
        try {
            for (const [index, file] of selectedFiles.entries()) {
                const progressItem = document.createElement('div');
                progressItem.innerHTML = `
                    <div class="flex justify-between text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                        <span>${file.name}</span>
                        <span id="progress-text-${index}">0%</span>
                    </div>
                    <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                        <div id="progress-bar-${index}" class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style="width: 0%"></div>
                    </div>
                `;
                fileProgress.appendChild(progressItem);

                try {
                    if (file.type === 'application/pdf') {
                        await compressPDF(file, index, quality, mode, preserveMeta);
                    } else {
                        await compressImage(file, index, quality, mode, preserveMeta, webOptimized, progressive);
                    }
                } catch (error) {
                    console.error(`Compression error for ${file.name}:`, error);
                    showNotification(`❌ Failed to compress ${file.name}: ${error.message}`, 'error');
                    compressedFiles.push({ name: file.name, blob: file, originalSize: file.size });
                    totalCompressedSize += file.size;
                    updateProgress(index, 100);
                }

                completed++;
                const overallProgress = Math.round((completed / selectedFiles.length) * 100);
                overallProgressBar.style.width = `${overallProgress}%`;
                overallProgressText.textContent = `${overallProgress}%`;
            }

            showResults();
        } catch (error) {
            console.error('Unexpected error during compression:', error);
            showNotification('❌ An unexpected error occurred during compression.', 'error');
        } finally {
            isProcessing = false;
            fileInput.disabled = false;
            console.log('Compression complete, state reset:', { isProcessing, fileInputDisabled: fileInput.disabled });
        }
    });

    async function compressImage(file, index, quality, mode, preserveMeta, webOptimized, progressive) {
        return new Promise((resolve, reject) => {
            const effectiveQuality = mode === 'lossless' ? 1 : (mode === 'aggressive' ? quality * 0.5 : quality);
            const mimeType = progressive && (file.type === 'image/jpeg' || file.type === 'image/jpg') ? 'image/jpeg' : file.type;
            console.log(`Compressing image: ${file.name}, Type: ${file.type}, Quality: ${effectiveQuality}, MIME: ${mimeType}, Size: ${file.size} bytes`);

            const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const targetMimeType = validMimeTypes.includes(mimeType) ? mimeType : 'image/jpeg';

            try {
                new Compressor(file, {
                    quality: effectiveQuality,
                    maxWidth: webOptimized ? 1600 : undefined,
                    maxHeight: webOptimized ? 1600 : undefined,
                    mimeType: targetMimeType,
                    preserveExif: preserveMeta,
                    convertSize: webOptimized ? 500000 : Infinity,
                    success(result) {
                        console.log(`Image compressed: ${file.name}, Size: ${result.size} bytes, Type: ${result.type}`);
                        compressedFiles.push({ 
                            name: getCompressedFileName(file.name, result.type), 
                            blob: result, 
                            originalSize: file.size 
                        });
                        totalCompressedSize += result.size;
                        updateProgress(index, 100);
                        resolve();
                    },
                    error(err) {
                        console.error(`Compressor.js error for ${file.name}:`, err);
                        reject(new Error(`Image compression failed: ${err.message}`));
                    },
                });
            } catch (err) {
                reject(new Error(`Compressor.js initialization failed: ${err.message}`));
            }
        });
    }

    async function compressPDF(file, index, quality, mode, preserveMeta) {
        try {
            console.log(`Compressing PDF: ${file.name}, Mode: ${mode}, Quality: ${quality}, Size: ${file.size} bytes`);
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            if (!preserveMeta) {
                pdfDoc.setTitle('');
                pdfDoc.setAuthor('');
                pdfDoc.setSubject('');
                pdfDoc.setKeywords([]);
                pdfDoc.setProducer('');
                pdfDoc.setCreator('');
                pdfDoc.setCreationDate(undefined);
                pdfDoc.setModificationDate(undefined);
            }

            if (mode === 'aggressive') {
                const pages = pdfDoc.getPages();
                for (const page of pages) {
                    try {
                        const images = page.node.Images() || [];
                        for (const [ref, img] of Object.entries(images)) {
                            if (img.name === 'JPEG' || img.name === 'PNG') {
                                const bitmap = await pdfDoc.context.lookup(img.ref);
                                if (!bitmap) continue;
                                const canvas = document.createElement('canvas');
                                canvas.width = bitmap.width || 1000;
                                canvas.height = bitmap.height || 1000;
                                const ctx = canvas.getContext('2d');
                                const imgData = ctx.createImageData(canvas.width, canvas.height);
                                const bytes = bitmap.getBytes();
                                if (bytes) {
                                    imgData.data.set(bytes);
                                    ctx.putImageData(imgData, 0, 0);
                                    const compressedData = canvas.toDataURL('image/jpeg', quality * 0.6);
                                    const newImg = await pdfDoc.embedJpg(compressedData);
                                    img.replace(newImg);
                                    console.log(`Compressed image in ${file.name}, Ref: ${ref}`);
                                }
                            }
                        }
                    } catch (imgError) {
                        console.warn(`Skipping image in ${file.name}: ${imgError.message}`);
                    }
                }
            }

            const fonts = pdfDoc.getFonts();
            for (const font of fonts) {
                try {
                    await font.embed({ subset: mode !== 'lossless' });
                } catch (fontError) {
                    console.warn(`Font subsetting failed for ${file.name}: ${fontError.message}`);
                }
            }

            const compressedPdfBytes = await pdfDoc.save({ 
                useObjectStreams: true, 
                addDefaultPage: false,
                updateMetadata: !preserveMeta 
            });
            const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            console.log(`PDF compressed: ${file.name}, Size: ${blob.size} bytes`);
            compressedFiles.push({ 
                name: getCompressedFileName(file.name, 'application/pdf'), 
                blob, 
                originalSize: file.size 
            });
            totalCompressedSize += blob.size;
            updateProgress(index, 100);
        } catch (error) {
            throw new Error(`PDF compression failed: ${error.message}`);
        }
    }

    function updateProgress(index, percentage) {
        const progressBar = document.getElementById(`progress-bar-${index}`);
        const progressText = document.getElementById(`progress-text-${index}`);
        if (progressBar && progressText) {
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}%`;
        }
    }

    function showResults() {
        progressSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');

        const reduction = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(2) : 0;
        totalReduction.textContent = `${reduction}%`;
        originalSize.textContent = formatFileSize(totalOriginalSize);
        compressedSize.textContent = formatFileSize(totalCompressedSize);

        downloadLinks.innerHTML = '';
        compressedFiles.forEach((file) => {
            const url = URL.createObjectURL(file.blob);
            const linkItem = document.createElement('div');
            linkItem.className = 'flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg';
            linkItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                    </svg>
                    <span class="text-sm truncate max-w-xs">${file.name}</span>
                </div>
                <a href="${url}" download="${file.name}" class="text-sm text-accent-600 hover:text-accent-700 font-medium">Download</a>
            `;
            downloadLinks.appendChild(linkItem);
            setTimeout(() => URL.revokeObjectURL(url), 300000);
        });

        updateFileStatus('success', 'Compression Complete', `Saved ${reduction}% across ${compressedFiles.length} file${compressedFiles.length > 1 ? 's' : ''}`, '');
        showNotification(`🎉 Compression complete! Saved ${reduction}%`, 'success');
    }

    downloadAllBtn?.addEventListener('click', async () => {
        const zip = new JSZip();
        compressedFiles.forEach((file) => zip.file(file.name, file.blob));
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed_files.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('✅ ZIP downloaded successfully', 'success');
    });

    compressMoreBtn?.addEventListener('click', () => {
        resetUI();
        updateFileStatus('info', 'Ready to Compress', 'Select files to start', 'Choose Files');
        showNotification('✅ Ready to compress more files', 'info');
    });

    clearBtn?.addEventListener('click', () => {
        resetUI();
        updateFileStatus('info', 'Ready to Compress', 'Select files to start', 'Choose Files');
        showNotification('✅ Files cleared', 'info');
    });

    function resetUI() {
        selectedFiles = [];
        compressedFiles = [];
        totalOriginalSize = 0;
        totalCompressedSize = 0;
        isProcessing = false;
        fileInput.value = '';
        fileInput.disabled = false;
        filesContainer.innerHTML = '';
        fileList.classList.add('hidden');
        compressionSettings.classList.add('hidden');
        progressSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        compressBtn.disabled = true;
        previewBtn.classList.add('hidden');
        fileStatusIndicator.classList.add('hidden');
        console.log('UI reset, fileInput disabled:', fileInput.disabled);
    }

    function getCompressedFileName(originalName, mimeType) {
        const parts = originalName.split('.');
        const name = parts.slice(0, -1).join('.');
        const ext = mimeType === 'application/pdf' ? 'pdf' : mimeType.split('/')[1];
        return `${name}_compressed.${ext}`;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showNotification(message, type = 'info') {
        console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        const colors = {
            info: 'bg-blue-100 border border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300',
            success: 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
            error: 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
        };
        notification.className += ` ${colors[type]}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium">${message}</span>
                <button class="ml-2 text-current opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('translate-x-full');
                setTimeout(() => document.body.removeChild(notification), 300);
            }
        }, 5000);
    }

    // Initialize file status
    updateFileStatus('info', 'Ready to Compress', 'Select files to start', 'Choose Files');
    console.log('✅ Compress.js initialized');
}); 