function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.classList.toggle("hidden");
}

// Close dropdown on outside click
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("dropdownMenu");
  const button = document.querySelector("button[onclick='toggleDropdown()']");
  if (!dropdown.contains(e.target) && !button.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

const fileInput = document.getElementById("file-input");
const fileList = document.getElementById("file-list");
const mergeBtn = document.getElementById("merge-btn");
const loader = document.getElementById("loader");

let selectedFiles = [];

fileInput.addEventListener("change", (e) => {
  selectedFiles = Array.from(e.target.files);
  if (selectedFiles.length > 0) {
    fileList.innerHTML = selectedFiles.map(f => `<li>${f.name}</li>`).join("");
    fileList.classList.remove("hidden");
    mergeBtn.disabled = false;
  }
});

mergeBtn.addEventListener("click", () => {
  if (selectedFiles.length === 0) return;

  mergeBtn.innerText = "Merging...";
  mergeBtn.disabled = true;
  loader.classList.remove("hidden");

  setTimeout(() => {
    loader.classList.add("hidden");
    mergeBtn.innerText = "Merge Now";
    mergeBtn.disabled = false;
    alert(`✅ ${selectedFiles.length} files merged successfully!`);
  }, 2000);
});
