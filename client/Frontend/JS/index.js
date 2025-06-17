// ✅ Hamburger Menu Animation
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");
const line3 = document.getElementById("line3");

let isOpen = false;

if (menuBtn && mobileMenu && line1 && line2 && line3) {
  menuBtn.addEventListener("click", () => {
    isOpen = !isOpen;
    mobileMenu.classList.toggle("hidden");

    line1.classList.toggle("rotate-45");
    line1.classList.toggle("translate-y-1.5");

    line2.classList.toggle("opacity-0");

    line3.classList.toggle("-rotate-45");
    line3.classList.toggle("-translate-y-1.5");
  });

  document.addEventListener("click", (e) => {
    const isInside = menuBtn.contains(e.target) || mobileMenu.contains(e.target);
    if (!isInside && isOpen) {
      isOpen = false;
      mobileMenu.classList.add("hidden");

      line1.classList.remove("rotate-45", "translate-y-1.5");
      line2.classList.remove("opacity-0");
      line3.classList.remove("-rotate-45", "-translate-y-1.5");
    }
  });
}

// ✅ Theme Toggle for Mobile + Desktop
const themeToggleMobile = document.getElementById("theme-toggle");
const themeToggleDesktop = document.getElementById("theme-toggle-desktop");

const toggleTheme = () => {
  document.documentElement.classList.toggle("dark");

  const isDark = document.documentElement.classList.contains("dark");
  const icon = isDark ? "🌙" : "🌞";

  if (themeToggleMobile) themeToggleMobile.textContent = icon;
  if (themeToggleDesktop) themeToggleDesktop.textContent = icon;
};

if (themeToggleMobile) themeToggleMobile.addEventListener("click", toggleTheme);
if (themeToggleDesktop) themeToggleDesktop.addEventListener("click", toggleTheme);

// ✅ Set correct initial icon on load
window.addEventListener("DOMContentLoaded", () => {
  const isDark = document.documentElement.classList.contains("dark");
  const icon = isDark ? "🌙" : "🌞";
  if (themeToggleMobile) themeToggleMobile.textContent = icon;
  if (themeToggleDesktop) themeToggleDesktop.textContent = icon;
});
