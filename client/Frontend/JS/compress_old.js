// Working Compression Script for compress.html
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Compression script loaded');
    
    // Get DOM elements
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const fileInfo = document.getElementById('file-info');
    const compressBtn = document.getElementById('compress-btn');
    const compressionOptions = document.getElementById('compression-options');
    const compressionLevel = document.getElementById('compression-level');
    const compressionPercentage = document.getElementById('compression-percentage');
    const loader = document.getElementById('loader');
    const progressInfo = document.getElementById('progress-info');
    const downloadArea = document.getElementById('download-area');
    const downloadButton = document.getElementById('download-button');
    const beforeAfter = document.getElementById('before-after');
    const beforeImage = document.getElementById('before-image');
    const afterImage = document.getElementById('after-image');
    const beforeSize = document.getElementById('before-size');
    const afterSize = document.getElementById('after-size');
    
    let selectedFile = null;
    let originalFileSize = 0;
    
    // Check if required libraries are loaded
    if (typeof Compressor === 'undefined') {
        console.error('❌ Compressor.js library not loaded!');
        showError('Required compression library not loaded. Please refresh the page.');
        return;
    }
    
    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            handleFileSelection(file);
        });
    }
    
    // Upload area click handler
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Drag and drop handlers
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('bg-gray-200', 'dark:bg-gray-600');
        });
        
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.classList.remove('bg-gray-200', 'dark:bg-gray-600');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('bg-gray-200', 'dark:bg-gray-600');
            const file = e.dataTransfer.files[0];
            handleFileSelection(file);
        });
    }
    
    // Compression level slider
    if (compressionLevel && compressionPercentage) {
        compressionLevel.addEventListener('input', function() {
            const value = compressionLevel.value;
            compressionPercentage.textContent = value + '%';
        });
    }
    
    // Compress button handler
    if (compressBtn) {
        compressBtn.addEventListener('click', function() {
            if (selectedFile) {
                compressFile();
            }
        });
    }
    
    // Handle file selection
    function handleFileSelection(file) {
        console.log('📁 File selected:', file ? file.name : 'None');
        
        if (!file) {
            resetUI();
            return;
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            showError('Please select a valid file type (JPEG, PNG, WebP, or PDF)');
            resetUI();
            return;
        }
        
        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            showError('File size too large. Please select a file smaller than 50MB.');
            resetUI();
            return;
        }
        
        selectedFile = file;
        originalFileSize = file.size;
        
        // Update UI
        if (fileInfo) {
            fileInfo.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
            fileInfo.classList.remove('hidden', 'text-red-500');
            fileInfo.classList.add('text-green-600', 'dark:text-green-400');
        }
        
        if (compressionOptions) {
            compressionOptions.classList.remove('hidden');
        }
        
        if (compressBtn) {
            compressBtn.disabled = false;
            compressBtn.classList.add('hover:scale-105');
        }
        
        hideDownloadArea();
    }
    
    // Compress file function
    async function compressFile() {
        if (!selectedFile) return;
        
        console.log('⚡ Starting compression...');
        
        // Show loading
        showLoading();
        
        try {
            let compressedFile;
            const quality = getCompressionQuality();
            
            if (selectedFile.type === 'application/pdf') {
                // For PDF, we'll just copy it for now (PDF compression is complex)
                compressedFile = selectedFile;
                updateProgress('Processing PDF...');
            } else {
                // Compress image
                compressedFile = await compressImage(selectedFile, quality);
            }
            
            // Show results
            showResults(compressedFile);
            
        } catch (error) {
            console.error('❌ Compression error:', error);
            showError('Compression failed: ' + error.message);
        } finally {
            hideLoading();
        }
    }
    
    // Compress image using Compressor.js
    function compressImage(file, quality) {
        return new Promise((resolve, reject) => {
            updateProgress('Compressing image...');
            
            new Compressor(file, {
                quality: quality / 100, // Convert percentage to decimal
                maxWidth: 1920,
                maxHeight: 1920,
                mimeType: 'image/jpeg', // Convert all images to JPEG for better compression
                success(result) {
                    console.log('✅ Image compressed successfully');
                    resolve(result);
                },
                error(error) {
                    console.error('❌ Image compression failed:', error);
                    reject(error);
                }
            });
        });
    }
    
    // Get compression quality from slider
    function getCompressionQuality() {
        if (compressionLevel) {
            return parseInt(compressionLevel.value);
        }
        return 80; // Default quality
    }
    
    // Show compression results
    function showResults(compressedFile) {
        const originalSize = originalFileSize;
        const compressedSize = compressedFile.size;
        const reduction = ((originalSize - compressedSize) / originalSize) * 100;
        
        console.log('📊 Compression results:', {
            original: formatFileSize(originalSize),
            compressed: formatFileSize(compressedSize),
            reduction: reduction.toFixed(1) + '%'
        });
        
        // Update file info
        if (fileInfo) {
            fileInfo.textContent = `✅ Compressed! ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${reduction.toFixed(1)}% reduction)`;
            fileInfo.classList.add('text-green-600', 'dark:text-green-400');
        }
        
        // Show before/after for images
        if (selectedFile.type.startsWith('image/')) {
            showBeforeAfter(selectedFile, compressedFile);
        }
        
        // Setup download
        setupDownload(compressedFile);
        
        // Show download area
        if (downloadArea) {
            downloadArea.classList.remove('hidden');
        }
    }
    
    // Show before and after images
    function showBeforeAfter(originalFile, compressedFile) {
        if (!beforeAfter || !beforeImage || !afterImage || !beforeSize || !afterSize) return;
        
        try {
            beforeImage.src = URL.createObjectURL(originalFile);
            afterImage.src = URL.createObjectURL(compressedFile);
            beforeSize.textContent = `Size: ${formatFileSize(originalFile.size)}`;
            afterSize.textContent = `Size: ${formatFileSize(compressedFile.size)}`;
            beforeAfter.classList.remove('hidden');
        } catch (error) {
            console.error('Error showing before/after:', error);
        }
    }
    
    // Setup download functionality
    function setupDownload(compressedFile) {
        if (!downloadButton) return;
        
        const fileName = generateFileName(selectedFile.name);
        const downloadUrl = URL.createObjectURL(compressedFile);
        
        downloadButton.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-1 4h8a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Download ${fileName}
        `;
        
        downloadButton.onclick = function() {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
                if (beforeImage && beforeImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(beforeImage.src);
                }
                if (afterImage && afterImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(afterImage.src);
                }
            }, 1000);
            
            console.log('📥 File downloaded:', fileName);
        };
    }
    
    // Generate compressed file name
    function generateFileName(originalName) {
        const parts = originalName.split('.');
        const extension = parts.pop();
        const name = parts.join('.');
        
        // For images converted to JPEG
        if (selectedFile.type.startsWith('image/') && extension !== 'jpg' && extension !== 'jpeg') {
            return `${name}_compressed.jpg`;
        }
        
        return `${name}_compressed.${extension}`;
    }
    
    // Show loading state
    function showLoading() {
        if (loader) {
            loader.classList.remove('hidden');
        }
        if (compressBtn) {
            compressBtn.disabled = true;
            compressBtn.textContent = 'Compressing...';
        }
        hideDownloadArea();
    }
    
    // Hide loading state
    function hideLoading() {
        if (loader) {
            loader.classList.add('hidden');
        }
        if (compressBtn) {
            compressBtn.disabled = false;
            compressBtn.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Compress Now
            `;
        }
        if (progressInfo) {
            progressInfo.textContent = '';
        }
    }
    
    // Update progress
    function updateProgress(message) {
        if (progressInfo) {
            progressInfo.textContent = message;
        }
        console.log('⏳ Progress:', message);
    }
    
    // Show error message
    function showError(message) {
        console.error('❌ Error:', message);
        
        if (fileInfo) {
            fileInfo.textContent = '❌ ' + message;
            fileInfo.classList.remove('hidden', 'text-green-600', 'dark:text-green-400');
            fileInfo.classList.add('text-red-500');
        }
        
        hideLoading();
        hideDownloadArea();
    }
    
    // Hide download area
    function hideDownloadArea() {
        if (downloadArea) {
            downloadArea.classList.add('hidden');
        }
        if (beforeAfter) {
            beforeAfter.classList.add('hidden');
        }
    }
    
    // Reset UI to initial state
    function resetUI() {
        selectedFile = null;
        originalFileSize = 0;
        
        if (fileInput) {
            fileInput.value = '';
        }
        
        if (fileInfo) {
            fileInfo.textContent = '';
            fileInfo.classList.add('hidden');
            fileInfo.classList.remove('text-red-500', 'text-green-600', 'dark:text-green-400');
        }
        
        if (compressionOptions) {
            compressionOptions.classList.add('hidden');
        }
        
        if (compressBtn) {
            compressBtn.disabled = true;
            compressBtn.classList.remove('hover:scale-105');
        }
        
        hideLoading();
        hideDownloadArea();
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Initialize
    resetUI();
    
    console.log('✅ Compression script initialized');
});
