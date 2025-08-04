document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');

  const updateThemeIcon = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const icon = isDark ? '🌙' : '🌞';
    if (themeToggle) themeToggle.textContent = icon;
    if (themeToggleMobile) themeToggleMobile.textContent = icon;
  };

  const applyTheme = () => {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    updateThemeIcon();
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
  };

  // Apply theme on page load
  applyTheme();

  // Add event listeners for theme toggle buttons
  themeToggle?.addEventListener('click', toggleTheme);
  themeToggleMobile?.addEventListener('click', toggleTheme);

  // Hamburger Menu
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  const line3 = document.getElementById('line3');
  let isMenuOpen = false;

  menuBtn?.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    mobileMenu.classList.toggle('hidden');
    line1.classList.toggle('rotate-45');
    line1.classList.toggle('translate-y-1.5');
    line2.classList.toggle('opacity-0');
    line3.classList.toggle('-rotate-45');
    line3.classList.toggle('-translate-y-1.5');
  });

  document.addEventListener('click', (e) => {
    const isOutside = !menuBtn.contains(e.target) && !mobileMenu.contains(e.target);
    if (isOutside && isMenuOpen) {
      isMenuOpen = false;
      mobileMenu.classList.add('hidden');
      line1.classList.remove('rotate-45', 'translate-y-1.5');
      line2.classList.remove('opacity-0');
      line3.classList.remove('-rotate-45', '-translate-y-1.5');
    }
  });

  // Tools Dropdown
  const toolsDropdown = document.getElementById('tools-dropdown');
  const dropdownMenu = document.getElementById('dropdown-menu');

  toolsDropdown?.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    const isOutside = !toolsDropdown.contains(e.target) && !dropdownMenu.contains(e.target);
    if (isOutside) {
      dropdownMenu.classList.add('hidden');
    }
  });
});