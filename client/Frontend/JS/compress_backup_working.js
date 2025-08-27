document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Enhanced Compress.js loaded');
    
    // Get elements that exist in your HTML
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const compressBtn = document.getElementById('compress-btn');
    const clearBtn = document.getElementById('clear-btn');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    
    let selectedFile = null;
    let isProcessing = false;
    let compressedFile = null;
    
    // Initialize
    if (typeof Compressor === 'undefined') {
        alert('❌ Compression library not loaded! Please refresh the page.');
        return;
    }
    
    console.log('✅ Compressor.js loaded successfully');
    
    // File input handler
    fileInput?.addEventListener('change', function(e) {
        if (e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });
    
    // Upload area click
    uploadArea?.addEventListener('click', function() {
        fileInput?.click();
    });
    
    // Quality slider
    qualitySlider?.addEventListener('input', function() {
        if (qualityValue) {
            qualityValue.textContent = qualitySlider.value + '%';
        }
    });
    
    // Compress button
    compressBtn?.addEventListener('click', function() {
        if (selectedFile && !isProcessing) {
            compressFile();
        }
    });
    
    function handleFile(file) {
        console.log('📁 File selected:', file.name);
        
        if (!isValidFile(file)) {
            showNotification('❌ Invalid file! Please select PDF, JPEG, PNG, or WebP under 100MB', 'error');
            return;
        }
        
        selectedFile = file;
        
        // Enable compress button
        if (compressBtn) {
            compressBtn.disabled = false;
            compressBtn.textContent = `Compress ${file.name}`;
        }
        
        // Show compression settings
        const compressionSettings = document.getElementById('compression-settings');
        compressionSettings?.classList.remove('hidden');
        
        showNotification(`✅ File ready: ${file.name} (${formatFileSize(file.size)})`, 'success');
    }
    
    function isValidFile(file) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 100 * 1024 * 1024; // 100MB
        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }
    
    async function compressFile() {
        if (!selectedFile) return;
        
        isProcessing = true;
        showNotification('⚡ Starting compression...', 'info');
        
        // Show progress
        const progressSection = document.getElementById('progress-section');
        progressSection?.classList.remove('hidden');
        
        // Disable button
        if (compressBtn) {
            compressBtn.disabled = true;
            compressBtn.textContent = 'Compressing...';
        }
        
        try {
            const quality = (qualitySlider?.value || 80) / 100;
            console.log(`🔄 Compressing with quality: ${quality}`);
            
            const compressedFile = await new Promise((resolve, reject) => {
                if (selectedFile.type === 'application/pdf') {
                    // For PDF, just return original (PDF compression is complex)
                    resolve(new File([selectedFile], selectedFile.name, { type: selectedFile.type }));
                    return;
                }
                
                new Compressor(selectedFile, {
                    quality: quality,
                    maxWidth: 1920,
                    maxHeight: 1920,
                    mimeType: 'image/jpeg',
                    success(result) {
                        resolve(result);
                    },
                    error(err) {
                        reject(err);
                    }
                });
            });
            
            const reduction = ((selectedFile.size - compressedFile.size) / selectedFile.size) * 100;
            
            // Show results
            showResults(compressedFile, reduction);
            
            showNotification(`🎉 Compression complete! Saved ${reduction.toFixed(1)}%`, 'success');
            
        } catch (error) {
            console.error('❌ Compression failed:', error);
            showNotification('❌ Compression failed: ' + error.message, 'error');
        } finally {
            isProcessing = false;
            
            // Hide progress
            const progressSection = document.getElementById('progress-section');
            progressSection?.classList.add('hidden');
            
            // Re-enable button
            if (compressBtn) {
                compressBtn.disabled = false;
                compressBtn.textContent = 'Compress Again';
            }
        }
    }
    
    function showResults(compressedFile, reduction) {
        // Show results section
        const resultsSection = document.getElementById('results-section');
        resultsSection?.classList.remove('hidden');
        
        // Update stats
        const totalReduction = document.getElementById('total-reduction');
        const originalSize = document.getElementById('original-size');
        const compressedSize = document.getElementById('compressed-size');
        
        if (totalReduction) totalReduction.textContent = reduction.toFixed(1) + '%';
        if (originalSize) originalSize.textContent = formatFileSize(selectedFile.size);
        if (compressedSize) compressedSize.textContent = formatFileSize(compressedFile.size);
        
        // Create download link
        createDownloadLink(compressedFile);
    }
    
    function createDownloadLink(compressedFile) {
        const downloadLinks = document.getElementById('download-links');
        if (!downloadLinks) return;
        
        const fileName = getCompressedFileName(selectedFile.name);
        const downloadUrl = URL.createObjectURL(compressedFile);
        
        downloadLinks.innerHTML = `
            <div class="text-center">
                <button id="download-compressed" class="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
                    📥 Download ${fileName}
                </button>
            </div>
        `;
        
        const downloadBtn = document.getElementById('download-compressed');
        downloadBtn?.addEventListener('click', function() {
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showNotification('✅ File downloaded successfully!', 'success');
            console.log('📥 Downloaded:', fileName);
        });
    }
    
    function getCompressedFileName(originalName) {
        const parts = originalName.split('.');
        const extension = parts.pop();
        const name = parts.join('.');
        return `${name}_compressed.${extension}`;
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
            info: 'bg-blue-100 border border-blue-300 text-blue-800',
            success: 'bg-green-100 border border-green-300 text-green-800',
            error: 'bg-red-100 border border-red-300 text-red-800'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
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
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    console.log('✅ Compress.js initialized successfully');
});  