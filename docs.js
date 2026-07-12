const docsSidebar = document.querySelector("#docsSidebar");
const docsToggle = document.querySelector(".docs-sidebar-toggle");
const docsBackdrop = document.querySelector(".docs-backdrop");
const currentPage = document.body.dataset.page;

document.querySelectorAll(".docs-group a[data-page]").forEach((link) => {
  if (link.dataset.page === currentPage) {
    link.classList.add("is-active");
    link.closest("details")?.setAttribute("open", "");
  }
});

const setSidebarOpen = (open) => {
  docsSidebar?.classList.toggle("is-open", open);
  docsBackdrop?.classList.toggle("is-visible", open);
  docsToggle?.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
};

docsToggle?.addEventListener("click", () => {
  setSidebarOpen(!docsSidebar?.classList.contains("is-open"));
});

docsBackdrop?.addEventListener("click", () => setSidebarOpen(false));

docsSidebar?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setSidebarOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSidebarOpen(false);
  }
});

const tocNav = document.querySelector("#tocNav");
const headings = [...document.querySelectorAll(".doc-section h2, .doc-section h3")];

if (tocNav) {
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `section-${index + 1}`;
    }

    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.dataset.level = heading.tagName === "H3" ? "3" : "2";
    tocNav.append(link);
  });
}

if (headings.length && "IntersectionObserver" in window) {
  const tocLinks = [...document.querySelectorAll("#tocNav a")];
  const observer = new IntersectionObserver(
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
