// --- Tools Dropdown Toggle (Desktop) ---
function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  if (menu) {
    menu.classList.toggle("hidden");
  }
}

// --- Hamburger Mobile Menu Toggle ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger?.addEventListener('click', () => {
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
});

// --- Close Mobile Menu on Outside Click ---
document.addEventListener('click', (e) => {
  const target = e.target;
  const isOutside = !hamburger?.contains(target) && !mobileMenu?.contains(target);
  if (isOutside) {
    mobileMenu?.classList.add('hidden');
  }
});

// --- Theme Toggle (Dark/Light with Persistent Storage) ---
const themeToggle = document.getElementById('theme-toggle');
const themeToggleMobile = document.getElementById('theme-toggle-mobile');

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
const icon = isDark ? '🌙' : '☀️';
  if (themeToggle) themeToggle.textContent = icon;
  if (themeToggleMobile) themeToggleMobile.textContent = icon;
}

document.addEventListener('DOMContentLoaded', () => {
  // Apply stored theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  updateThemeIcon();

  themeToggle?.addEventListener('click', toggleTheme);
  themeToggleMobile?.addEventListener('click', toggleTheme);
});

// --- File Upload & Compress Button ---
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const compressBtn = document.getElementById('compress-btn');
const loader = document.getElementById('loader');

fileInput?.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    fileInfo.textContent = `File selected: ${file.name}`;
    fileInfo.classList.remove('hidden');
    compressBtn.disabled = false;
  } else {
    fileInfo.textContent = '';
    fileInfo.classList.add('hidden');
    compressBtn.disabled = true;
  }
});

compressBtn?.addEventListener('click', () => {
  compressBtn.disabled = true;
  loader.classList.remove('hidden');
  fileInfo.textContent = 'Compressing...';

  // Simulate compression (replace with actual logic later)
  setTimeout(() => {
    loader.classList.add('hidden');
    fileInfo.textContent = 'Compression complete ✅ (simulated)';
    compressBtn.disabled = false;
  }, 2000);
});
