const PAGE_ROUTES = {
  overview: [
    { href: "./index.html", eyebrow: "返回", label: "首页" },
    { href: "./agent-tooling.html", eyebrow: "下一页", label: "Agent 工具链复盘" },
  ],
  "case-study": [
    { href: "./projects.html", eyebrow: "上一页", label: "项目索引" },
    { href: "./notes.html", eyebrow: "下一页", label: "手记" },
  ],
  notes: [
    { href: "./agent-tooling.html", eyebrow: "上一页", label: "Agent 工具链复盘" },
    { href: "./updates.html", eyebrow: "下一页", label: "动态" },
  ],
  updates: [
    { href: "./notes.html", eyebrow: "上一页", label: "手记" },
    { href: "./about.html", eyebrow: "下一页", label: "关于我" },
  ],
  about: [
    { href: "./updates.html", eyebrow: "上一页", label: "动态" },
    { href: "./index.html", eyebrow: "完成浏览", label: "返回首页" },
  ],
};

export const renderPageRoute = (page) =>
  (PAGE_ROUTES[page] ?? [])
    .map(
      ({ href, eyebrow, label }, index) =>
        '<a class="page-route__link' +
        (index ? " page-route__link--next" : "") +
        '" href="' +
        href +
        '"><span>' +
        eyebrow +
        "</span><strong>" +
        (index ? label + " →" : "← " + label) +
        "</strong></a>",
    )
    .join("");

export const initPageRoute = (root = globalThis.document) => {
  const pageRoute = root?.querySelector("[data-page-route]");
  if (pageRoute) pageRoute.innerHTML = renderPageRoute(root.body?.dataset?.page);
};

if (typeof document !== "undefined") initPageRoute(document);
