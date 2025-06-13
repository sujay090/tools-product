function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.classList.toggle("hidden");
}

// Optional: hide dropdown when clicking outside
document.addEventListener('click', function (event) {
  const dropdown = document.getElementById("dropdownMenu");
  const button = event.target.closest("button");
  if (!dropdown.contains(event.target) && !button) {
    dropdown.classList.add("hidden");
  }
});


// Compress.js - A simple file compression tool
// This script handles file selection and compression simulation

document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const compressBtn = document.getElementById('compress-btn');
  const loader = document.getElementById('loader');

  let selectedFile = null;

  fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];

    if (selectedFile) {
      fileInfo.classList.remove('hidden');
      fileInfo.innerText = `Selected File: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`;
      compressBtn.disabled = false;
    }
  });

  compressBtn.addEventListener('click', () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    compressBtn.innerText = "Compressing...";
    compressBtn.disabled = true;
    loader.classList.remove('hidden');

    setTimeout(() => {
      loader.classList.add('hidden');
      compressBtn.innerText = "Compress Now";
      compressBtn.disabled = false;
      alert(`✅ ${selectedFile.name} compressed successfully!`);
    }, 2000);
  });
});
