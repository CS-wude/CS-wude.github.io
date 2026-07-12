const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

const setMenuState = (isOpen, { restoreFocus = false } = {}) => {
  mainNav?.classList.toggle("is-open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
  document.body.classList.toggle("menu-open", isOpen);
  if (restoreFocus) menuToggle?.focus();
};

menuToggle?.addEventListener("click", () => {
  setMenuState(!mainNav?.classList.contains("is-open"));
});

mainNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuState(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav?.classList.contains("is-open")) {
    setMenuState(false, { restoreFocus: true });
  }
});

const desktopQuery = window.matchMedia("(min-width: 761px)");
desktopQuery.addEventListener?.("change", (event) => {
  if (event.matches) setMenuState(false);
});
