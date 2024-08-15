let openBtn = document.querySelector("#open-btn");
let menu = document.querySelector(".menu-ul");
let icon = document.querySelector(".icon-menu");
openBtn.onclick = function openMenu() {
  menu.classList.toggle("open");
  icon.classList.toggle("ri-menu-4-line");
  icon.classList.toggle("ri-close-fill");
  openBtn.style.zIndex = "999999";
};
