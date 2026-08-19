export const setSidebarState = (
  open,
  { restoreFocus = false, root = globalThis.document } = {},
) => {
  if (!root) return;
  const sidebar = root.querySelector("#docsSidebar");
  const toggle = root.querySelector(".docs-sidebar-toggle");
  const backdrop = root.querySelector(".docs-backdrop");

  sidebar?.classList.toggle("is-open", open);
  backdrop?.classList.toggle("is-visible", open);
  toggle?.setAttribute("aria-expanded", String(open));
  toggle?.setAttribute("aria-label", open ? "关闭目录" : "打开目录");
  if (toggle) toggle.textContent = open ? "关闭目录 ×" : "目录 ☰";
  root.body?.classList.toggle("docs-menu-open", open);
  if (restoreFocus) toggle?.focus();
};

export const initDocsShell = (
  root = globalThis.document,
  view = globalThis.window,
) => {
  if (!root || !view) return;
  const sidebar = root.querySelector("#docsSidebar");
  const toggle = root.querySelector(".docs-sidebar-toggle");
  const backdrop = root.querySelector(".docs-backdrop");
  const currentPage = root.body?.dataset.page;

  root.querySelectorAll(".docs-group a[data-page]").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("is-active");
      link.closest("details")?.setAttribute("open", "");
    }
  });

  toggle?.setAttribute("aria-label", "打开目录");
  toggle?.addEventListener("click", () => {
    setSidebarState(!sidebar?.classList.contains("is-open"), { root });
  });
  backdrop?.addEventListener("click", () => setSidebarState(false, { root }));
  sidebar?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setSidebarState(false, { root });
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar?.classList.contains("is-open")) {
      setSidebarState(false, { restoreFocus: true, root });
    }
  });

  const desktopQuery = view.matchMedia?.("(min-width: 881px)");
  desktopQuery?.addEventListener?.("change", (event) => {
    if (event.matches) setSidebarState(false, { root });
  });

  const tocNav = root.querySelector("#tocNav");
  const headings = [...root.querySelectorAll(".doc-section h2, .doc-section h3")];
  if (tocNav) {
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = root.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.dataset.level = heading.tagName === "H3" ? "3" : "2";
      tocNav.append(link);
    });
  }

  if (headings.length && typeof view.IntersectionObserver === "function") {
    const tocLinks = [...root.querySelectorAll("#tocNav a")];
    const observer = new view.IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        tocLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { rootMargin: "-18% 0px -70% 0px" },
    );
    headings.forEach((heading) => observer.observe(heading));
  }
};

if (typeof document !== "undefined" && typeof window !== "undefined") {
  initDocsShell();
}
