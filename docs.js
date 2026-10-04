import { PROJECTS } from "./data/projects.js";

const escapeHTML = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderLink = ({ href, text, page, attributes = "" }) =>
  '<a' +
  (page ? ' data-page="' + page + '"' : "") +
  (attributes ? " " + attributes : "") +
  ' href="' +
  escapeHTML(href) +
  '">' +
  escapeHTML(text) +
  "</a>";

export const renderDocsNavigation = ({ currentPage = "", headings = [] } = {}) => {
  const contentLinks = [
    { href: "./projects.html", text: "项目索引", page: "overview" },
    { href: "./agent-tooling.html", text: "Agent 工具链复盘", page: "case-study" },
    { href: "./notes.html", text: "全部手记", page: "notes" },
  ];
  const siteLinks = [
    { href: "./index.html", text: "首页" },
    { href: "./updates.html", text: "最近动态", page: "updates" },
    { href: "./about.html", text: "关于我", page: "about" },
  ];
  const currentLinks =
    currentPage === "overview"
      ? PROJECTS.map(({ slug, title }) => ({
          href: "./projects.html#" + slug,
          text: title,
          attributes: "data-project-link",
        }))
      : headings.map(({ id, text, level = "2" }) => ({
          href: "#" + id,
          text,
          attributes: 'data-current-section data-level="' + level + '"',
        }));
  const currentLabel =
    currentPage === "overview" ? "项目直达" : currentPage === "notes" ? "本页手记" : "本页目录";
  const currentGroupState = currentPage === "overview" ? "" : " open";
  const currentGroup = currentLinks.length
    ? '<details class="docs-group docs-group--current"' + currentGroupState + "><summary>" +
      currentLabel +
      "</summary><nav>" +
      currentLinks.map(renderLink).join("") +
      "</nav></details>"
    : "";

  return (
    '<details class="docs-group docs-group--content" open><summary>内容库</summary><nav>' +
    contentLinks.map(renderLink).join("") +
    "</nav></details>" +
    currentGroup +
    '<details class="docs-group docs-group--site" open><summary>站点</summary><nav>' +
    siteLinks.map(renderLink).join("") +
    "</nav></details>"
  );
};

export const setSidebarState = (
  open,
  { restoreFocus = false, conceal = false, root = globalThis.document } = {},
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
  const concealed = conceal && !open;
  sidebar?.toggleAttribute?.("inert", concealed);
  if (concealed) sidebar?.setAttribute("aria-hidden", "true");
  else sidebar?.removeAttribute?.("aria-hidden");
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
  const desktopQuery = view.matchMedia?.("(min-width: 881px)");
  const updateSidebar = (open, options = {}) =>
    setSidebarState(open, {
      ...options,
      root,
      conceal: desktopQuery ? !desktopQuery.matches : true,
    });

  toggle?.setAttribute("aria-label", "打开目录");
  toggle?.addEventListener("click", () => {
    updateSidebar(!sidebar?.classList.contains("is-open"));
  });
  backdrop?.addEventListener("click", () => updateSidebar(false));
  sidebar?.addEventListener("click", (event) => {
    if (event.target.closest("a")) updateSidebar(false);
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar?.classList.contains("is-open")) {
      updateSidebar(false, { restoreFocus: true });
    }
  });

  desktopQuery?.addEventListener?.("change", (event) => {
    setSidebarState(false, { root, conceal: !event.matches });
  });
  updateSidebar(false);

  const headings = [...root.querySelectorAll(".doc-section h2, .doc-section h3")];
  const headingData = headings.map((heading, index) => {
    const id = heading.id || heading.closest?.("[id]")?.id || "section-" + (index + 1);
    heading.id = id;
    return {
      id,
      text: heading.textContent,
      level: heading.tagName === "H3" ? "3" : "2",
    };
  });
  const navigation = root.querySelector("[data-docs-navigation]");
  if (navigation) {
    navigation.innerHTML = renderDocsNavigation({ currentPage, headings: headingData });
  }

  root.querySelectorAll(".docs-group a[data-page]").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("is-active");
      link.closest("details")?.setAttribute("open", "");
    }
  });

  if (headings.length && typeof view.IntersectionObserver === "function") {
    const tocLinks = [...root.querySelectorAll("[data-current-section]")];
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
