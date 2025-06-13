function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.classList.toggle("hidden");
}

// Dropdown close on outside click
document.addEventListener('click', function (e) {
  const dropdown = document.getElementById("dropdownMenu");
  const button = document.querySelector("button[onclick='toggleDropdown()']");
  if (!dropdown.contains(e.target) && !button.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

// File Upload and Convert Simulation
const fileInput = document.getElementById("file-input"); // null return ho raha
const fileInfo = document.getElementById("file-info");
const convertBtn = document.getElementById("convert-btn");
const loader = document.getElementById("loader");
let selectedFile = null;

fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  if (selectedFile) {
    fileInfo.innerText = `Selected File: ${selectedFile.name}`;
    fileInfo.classList.remove("hidden");
    convertBtn.disabled = false;
  }
});

convertBtn.addEventListener("click", () => {
  if (!selectedFile) return;

  convertBtn.innerText = "Converting...";
  convertBtn.disabled = true;
  loader.classList.remove("hidden");

  setTimeout(() => {
    convertBtn.innerText = "Convert Now";
    convertBtn.disabled = false;
    loader.classList.add("hidden");
    alert(`✅ ${selectedFile.name} converted successfully to ${document.getElementById("format").value.toUpperCase()}!`);
  }, 2000);
});
