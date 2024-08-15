let openBtn = document.querySelector("#open-btn");
let menu = document.querySelector(".menu-ul");
let icon = document.querySelector(".icon-menu");
openBtn.onclick = function openMenu() {
  menu.classList.toggle("open");
  icon.classList.toggle("ri-menu-4-line");
  icon.classList.toggle("ri-close-fill");
  openBtn.style.zIndex = "999999";
};

const toggleButton = document.getElementById("darkModeToggle");
const toggleButtonIcon = document.querySelector("#darkModeToggle i");
const body = document.body;

const currentMode = localStorage.getItem("theme");
if (currentMode === "dark") {
  body.classList.add("dark-mode");
}

toggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  toggleButtonIcon.classList.toggle("ri-moon-fill");
  toggleButtonIcon.classList.toggle("ri-sun-fill");
  const theme = body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", theme);
});
