/**
 * Menu Controll js Start
 * Pritam
 */
const menuButton = document.getElementById("menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const closeMenu = document.getElementById("close-menu");

menuButton.addEventListener("click", () => {
  mobileMenu.classList.add("active");
});
closeMenu.addEventListener("click", () => {
  mobileMenu.classList.remove("active");
});
/**
 * Menu Controll js End
 * Pritam
 */

// kjbkbkjkn