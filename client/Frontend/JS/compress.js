document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const compressBtn = document.getElementById('compress-btn');
  const loader = document.getElementById('loader');
  const downloadArea = document.getElementById('download-area');
  const downloadButton = document.getElementById('download-button');
  const compressionLevel = document.getElementById('compression-level');
  const compressionPercentage = document.getElementById('compression-percentage');
  const uploadArea = document.getElementById('upload-area');
  const progressInfo = document.getElementById('progress-info');
  const beforeAfter = document.getElementById('before-after');
  const beforeImage = document.getElementById('before-image');
  const afterImage = document.getElementById('after-image');
  const beforeSize = document.getElementById('before-size');
  const afterSize = document.getElementById('after-size');
  let rawFileSize = 0;
  let originalFile = null;
  let fontWarnings = false;

  // Update compression percentage display
  compressionLevel?.addEventListener('input', () => {
    compressionPercentage.textContent = `${compressionLevel.value}%`;
    compressionLevel.setAttribute('aria-valuenow', compressionLevel.value);
  });

  // Drag and Drop
  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('bg-gray-200', 'dark:bg-gray-600');
  });

  uploadArea?.addEventListener('dragleave', () => {
    uploadArea.classList.remove('bg-gray-200', 'dark:bg-gray-600');
  });

  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('bg-gray-200', 'dark:bg-gray-600');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files[0];
    handleFile(file);
  });

  function handleFile(file) {
    if (!file) {
      resetUI();
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      fileInfo.textContent = 'Error: Please upload a PDF or image (JPEG/PNG) file.';
      fileInfo.classList.remove('hidden');
      fileInfo.classList.add('text-red-500');
      compressBtn.disabled = true;
      compressionLevel.parentElement.classList.add('hidden');
      beforeAfter.classList.add('hidden');
      return;
    }
    // Check file size (limit to 50MB to prevent browser crashes)
    if (file.size > 50 * 1024 * 1024) {
      fileInfo.textContent = 'Error: File size exceeds 50MB limit.';
      fileInfo.classList.remove('hidden');
      fileInfo.classList.add('text-red-500');
      compressBtn.disabled = true;
      compressionLevel.parentElement.classList.add('hidden');
      beforeAfter.classList.add('hidden');
      return;
    }
    rawFileSize = file.size;
    originalFile = file;
    fileInfo.textContent = `File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    fileInfo.classList.remove('hidden', 'text-red-500');
    compressBtn.disabled = false;
    compressionLevel.parentElement.classList.remove('hidden');
    compressionPercentage.textContent = `${compressionLevel.value}%`;
    beforeAfter.classList.add('hidden');
    fontWarnings = false;
  }

  function resetUI() {
    fileInfo.textContent = '';
    fileInfo.classList.add('hidden');
    compressBtn.disabled = true;
    loader.classList.add('hidden');
    downloadArea.classList.add('hidden');
    compressionLevel.parentElement.classList.add('hidden');
    progressInfo.textContent = '';
    beforeAfter.classList.add('hidden');
    beforeImage.src = '';
    afterImage.src = '';
    beforeSize.textContent = '';
    afterSize.textContent = '';
    rawFileSize = 0;
    originalFile = null;
    fontWarnings = false;
  }

  async function compressImageData(imageData, quality) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([imageData], { type: 'image/jpeg' });
      new Compressor(blob, {
        quality: Math.max(0.1, quality),
        maxWidth: 1200,
        maxHeight: 1200,
        mimeType: 'image/jpeg',
        success(result) {
          result.arrayBuffer().then(resolve).catch(reject);
        },
        error(err) {
          reject(new Error(`Image compression failed: ${err.message}`));
        },
      });
    });
  }

  async function compressPDF(file, percentage, updateProgress) {
    try {
      const pdfDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const compressedPdf = await PDFLib.PDFDocument.create();
      const pages = pdfDoc.getPages();
      const quality = 1 - (percentage / 100); // 0% = quality 1, 100% = quality 0
      let hasImages = false;

      updateProgress(`Analyzing ${pages.length} page${pages.length > 1 ? 's' : ''}...`);

      // Copy fonts without subsetting to avoid errors
      const fontMap = new Map();
      const fontKeys = pdfDoc.context.enumerateIndirectObjects()
        .filter(([_, obj]) => obj instanceof PDFLib.PDFDict && obj.get(PDFLib.PDFName.of('Type')) === PDFLib.PDFName.of('Font'))
        .map(([ref]) => ref);

      for (const fontRef of fontKeys) {
        const font = pdfDoc.context.lookup(fontRef);
        if (font instanceof PDFLib.PDFDict) {
          try {
            // Try embedding standard font or copying font reference
            const fontName = font.get(PDFLib.PDFName.of('BaseFont'))?.toString() || 'Helvetica';
            const standardFont = PDFLib.StandardFonts[fontName.replace(/^\/|-.*/g, '')] || PDFLib.StandardFonts.Helvetica;
            const embeddedFont = await compressedPdf.embedFont(standardFont, { subset: false });
            fontMap.set(fontRef, embeddedFont.ref);
          } catch (error) {
            fontWarnings = true;
            updateProgress(`Skipping invalid font on page ${pages.length}...`);
            // Fallback to Helvetica if font embedding fails
            const embeddedFont = await compressedPdf.embedFont(PDFLib.StandardFonts.Helvetica, { subset: false });
            fontMap.set(fontRef, embeddedFont.ref);
          }
        }
      }

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        updateProgress(`Processing page ${i + 1} of ${pages.length}...`);
        const page = pages[i];
        const copiedPage = await compressedPdf.copyPages(pdfDoc, [i]);
        const newPage = compressedPdf.addPage(copiedPage[0]);

        // Compress images
        const images = page.node.get('XObject')?.dict?.values() || [];
        for (const imageRef of images) {
          if (imageRef instanceof PDFLib.PDFDict && imageRef.get(PDFLib.PDFName.of('Subtype')) === PDFLib.PDFName.of('Image')) {
            const image = pdfDoc.context.lookup(imageRef);
            if (image && image.get(PDFLib.PDFName.of('Filter')) === PDFLib.PDFName.of('DCTDecode')) {
              hasImages = true;
              updateProgress(`Compressing image on page ${i + 1}...`);
              const imageData = image.get(PDFLib.PDFName.of('Stream'))?.data;
              if (imageData) {
                try {
                  const compressedImageData = await compressImageData(imageData, quality);
                  const newImage = await compressedPdf.embedJpg(compressedImageData);
                  const xObjectKey = imageRef.lookup(PDFLib.PDFName.of('Name')) || PDFLib.PDFName.of(`Image${i}`);
                  newPage.node.set(PDFLib.PDFName.of('XObject'), compressedPdf.context.obj({ [xObjectKey]: newImage.ref }));
                } catch (error) {
                  updateProgress(`Skipping image compression on page ${i + 1}...`);
                }
              }
            }
          }
        }

        // Update font references in the page
        const resources = newPage.node.get(PDFLib.PDFName.of('Resources'));
        if (resources instanceof PDFLib.PDFDict) {
          const fontDict = resources.get(PDFLib.PDFName.of('Font'));
          if (fontDict instanceof PDFLib.PDFDict) {
            const newFontDict = compressedPdf.context.obj({});
            for (const [key, ref] of fontDict.entries()) {
              if (fontMap.has(ref)) {
                newFontDict.set(key, fontMap.get(ref));
              } else {
                // Fallback to Helvetica for missing fonts
                const embeddedFont = await compressedPdf.embedFont(PDFLib.StandardFonts.Helvetica, { subset: false });
                newFontDict.set(key, embeddedFont.ref);
              }
            }
            resources.set(PDFLib.PDFName.of('Font'), newFontDict);
          }
        }
      }

      // Optimize PDF structure
      updateProgress('Optimizing resources...');
      compressedPdf.context.enumerateIndirectObjects().forEach(([ref, obj]) => {
        if (obj instanceof PDFLib.PDFDict && obj.get(PDFLib.PDFName.of('Type')) === PDFLib.PDFName.of('Font') && !fontMap.has(ref)) {
          compressedPdf.context.delete(ref);
        }
      });

      const compressedBytes = await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: Math.max(10, 100 * quality),
        updateFieldAppearances: false,
      });

      const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });

      // If compressed size is larger or no images were compressed, return original with minimal optimization
      if (!hasImages || compressedBlob.size >= file.size) {
        updateProgress('Minimal compression possible, returning optimized file...');
        const optimizedBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          updateFieldAppearances: false,
        });
        return new Blob([optimizedBytes], { type: 'application/pdf' });
      }

      return compressedBlob;
    } catch (error) {
      throw new Error(`PDF compression failed: ${error.message}`);
    }
  }

  function compressImage(file, percentage) {
    return new Promise((resolve, reject) => {
      const quality = 1 - (percentage / 100); // 0% = quality 1, 100% = quality 0
      new Compressor(file, {
        quality: Math.max(0.1, quality),
        maxWidth: 1200,
        maxHeight: 1200,
        mimeType: file.type,
        success(result) {
          resolve(result);
        },
        error(err) {
          reject(new Error(`Image compression failed: ${err.message}`));
        },
      });
    });
  }

  compressBtn?.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    compressBtn.disabled = true;
    loader.classList.remove('hidden');
    fileInfo.textContent = 'Compressing...';
    progressInfo.textContent = `Raw file size: ${(rawFileSize / 1024).toFixed(2)} KB`;
    downloadArea.classList.add('hidden');
    beforeAfter.classList.add('hidden');
    fontWarnings = false;

    try {
      const percentage = parseInt(compressionLevel.value);
      let compressedFile;
      let outputFileName;

      const updateProgress = (message) => {
        progressInfo.textContent = `Raw file size: ${(rawFileSize / 1024).toFixed(2)} KB | ${message}`;
      };

      if (file.type === 'application/pdf') {
        compressedFile = await compressPDF(file, percentage, updateProgress);
        outputFileName = file.name.replace(/\.pdf$/, '_compressed.pdf');
      } else {
        updateProgress('Compressing image...');
        compressedFile = await compressImage(file, percentage);
        outputFileName = file.name.replace(/\.(jpg|jpeg|png)$/, '_compressed.$1');

        // Show Before and After for images
        beforeImage.src = URL.createObjectURL(originalFile);
        afterImage.src = URL.createObjectURL(compressedFile);
        beforeSize.textContent = `Size: ${(rawFileSize / 1024).toFixed(2)} KB`;
        afterSize.textContent = `Size: ${(compressedFile.size / 1024).toFixed(2)} KB`;
        beforeAfter.classList.remove('hidden');
      }

      const downloadUrl = URL.createObjectURL(compressedFile);
      downloadButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v6m0 0l-3-3m3 3l3-3"/>
        </svg>
        Download ${outputFileName} (${(compressedFile.size / 1024).toFixed(2)} KB)
      `;
      downloadButton.onclick = () => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = outputFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Clean up URLs to prevent memory leaks
        if (file.type !== 'application/pdf') {
          URL.revokeObjectURL(beforeImage.src);
          URL.revokeObjectURL(afterImage.src);
        }
        URL.revokeObjectURL(downloadUrl);
      };
      downloadArea.classList.remove('hidden');
      const sizeReduction = ((rawFileSize - compressedFile.size) / rawFileSize) * 100;
      if (file.type === 'application/pdf' && fontWarnings) {
        fileInfo.textContent = `Compression complete ⚠️ | Reduced from ${(rawFileSize / 1024).toFixed(2)} KB to ${(compressedFile.size / 1024).toFixed(2)} KB (some fonts could not be optimized)`;
      } else if (sizeReduction < 5 && file.type === 'application/pdf') {
        fileInfo.textContent = `Compression complete ✅ | Minimal size reduction achieved (${(compressedFile.size / 1024).toFixed(2)} KB)`;
      } else {
        fileInfo.textContent = `Compression complete ✅ | Reduced from ${(rawFileSize / 1024).toFixed(2)} KB to ${(compressedFile.size / 1024).toFixed(2)} KB`;
      }
    } catch (error) {
      fileInfo.textContent = `Error: ${error.message}. Try a different file or adjust compression settings.`;
      fileInfo.classList.add('text-red-500');
      beforeAfter.classList.add('hidden');
    } finally {
      compressBtn.disabled = false;
      loader.classList.add('hidden');
      progressInfo.textContent = '';
    }
  });
});