// Toggle desktop dropdown (Tools)
function toggleDropdown() {
  const dropdown = document.getElementById("dropdownMenu");
  dropdown.classList.toggle("hidden");
}

// Close dropdown if clicked outside (Desktop)
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("dropdownMenu");
  const button = event.target.closest("button");

  if (dropdown && !dropdown.contains(event.target) && !button) {
    dropdown.classList.add("hidden");
  }
});

// Mobile hamburger animation + toggle menu
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  let isMenuOpen = false;

  hamburger.addEventListener("click", function () {
    mobileMenu.classList.toggle("hidden");
    isMenuOpen = !isMenuOpen;

    const bars = hamburger.querySelectorAll("div");

    // Animate hamburger
    if (isMenuOpen) {
      bars[0].classList.add("rotate-45", "translate-y-1.5");
      bars[1].classList.add("opacity-0");
      bars[2].classList.add("-rotate-45", "-translate-y-1.5");
    } else {
      bars[0].classList.remove("rotate-45", "translate-y-1.5");
      bars[1].classList.remove("opacity-0");
      bars[2].classList.remove("-rotate-45", "-translate-y-1.5");
    }
  });

  // Close mobile menu on outside click
  document.addEventListener("click", function (e) {
    if (
      isMenuOpen &&
      !hamburger.contains(e.target) &&
      !mobileMenu.contains(e.target)
    ) {
      mobileMenu.classList.add("hidden");
      isMenuOpen = false;

      const bars = hamburger.querySelectorAll("div");
      bars[0].classList.remove("rotate-45", "translate-y-1.5");
      bars[1].classList.remove("opacity-0");
      bars[2].classList.remove("-rotate-45", "-translate-y-1.5");
    }
  });

  // File Compression Logic
  const fileInput = document.getElementById("file-input");
  const fileInfo = document.getElementById("file-info");
  const compressBtn = document.getElementById("compress-btn");
  const loader = document.getElementById("loader");

  let selectedFile = null;

  fileInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];

    if (selectedFile) {
      fileInfo.classList.remove("hidden");
      fileInfo.innerText = `Selected File: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`;
      compressBtn.disabled = false;
    }
  });

  compressBtn.addEventListener("click", () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    compressBtn.innerText = "Compressing...";
    compressBtn.disabled = true;
    loader.classList.remove("hidden");

    setTimeout(() => {
      loader.classList.add("hidden");
      compressBtn.innerText = "Compress Now";
      compressBtn.disabled = false;
      alert(`✅ ${selectedFile.name} compressed successfully!`);
    }, 2000);
  });

  // Update year in footer
  document.getElementById("year").textContent = new Date().getFullYear();
});
