export const setMenuState = (
  isOpen,
  { restoreFocus = false, root = globalThis.document } = {},
) => {
  if (!root) return;
  const menuToggle = root.querySelector(".menu-toggle");
  const mainNav = root.querySelector(".main-nav");

  mainNav?.classList.toggle("is-open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
  root.body?.classList.toggle("menu-open", isOpen);
  if (restoreFocus) menuToggle?.focus();
};

export const initRevealAnimations = (
  root = globalThis.document,
  view = globalThis.window,
) => {
  if (!root || !view) return;
  const elements = [...root.querySelectorAll("[data-reveal]")];
  if (!elements.length) return;

  const reduceMotion = view.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || typeof view.IntersectionObserver !== "function") {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  root.documentElement.classList.add("has-motion");
  const observer = new view.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -7%", threshold: 0.08 },
  );

  view.requestAnimationFrame(() => elements.forEach((element) => observer.observe(element)));
};

export const initSiteShell = (
  root = globalThis.document,
  view = globalThis.window,
) => {
  if (!root || !view) return;
  const menuToggle = root.querySelector(".menu-toggle");
  const mainNav = root.querySelector(".main-nav");

  menuToggle?.addEventListener("click", () => {
    setMenuState(!mainNav?.classList.contains("is-open"), { root });
  });

  mainNav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuState(false, { root });
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav?.classList.contains("is-open")) {
      setMenuState(false, { restoreFocus: true, root });
    }
  });

  const desktopQuery = view.matchMedia?.("(min-width: 761px)");
  desktopQuery?.addEventListener?.("change", (event) => {
    if (event.matches) setMenuState(false, { root });
  });

  root.querySelectorAll("#currentYear").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  initRevealAnimations(root, view);
};

if (typeof document !== "undefined" && typeof window !== "undefined") {
  initSiteShell();
}
