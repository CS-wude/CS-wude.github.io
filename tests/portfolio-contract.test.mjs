import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const loadProjects = () => import("../data/projects.js");
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const createClassList = () => {
  const values = new Set();
  return {
    contains: (name) => values.has(name),
    toggle: (name, force) => {
      if (force) values.add(name);
      else values.delete(name);
    },
  };
};

const createElement = () => {
  const attributes = new Map();
  const listeners = new Map();
  const element = {
    classList: createClassList(),
    focused: false,
    textContent: "",
    addEventListener: (type, listener) => listeners.set(type, listener),
    dispatch: (type, event = {}) => listeners.get(type)?.(event),
    focus: () => {
      element.focused = true;
    },
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, String(value)),
  };
  return element;
};

const createRoot = (selectors = {}) => {
  const listeners = new Map();
  return {
    body: { classList: createClassList(), dataset: {} },
    documentElement: { classList: createClassList() },
    addEventListener: (type, listener) => listeners.set(type, listener),
    dispatch: (type, event = {}) => listeners.get(type)?.(event),
    querySelector: (selector) => selectors[selector] ?? null,
    querySelectorAll: () => [],
  };
};

const publicTextFiles = async () => {
  const root = new URL("../", import.meta.url);
  const output = [];
  const visit = async (directory, prefix = "") => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = `${prefix}${entry.name}`;
      if (entry.isDirectory()) {
        if ([".git", ".worktrees", "docs", "tests"].includes(entry.name)) continue;
        await visit(new URL(`${entry.name}/`, directory), `${path}/`);
        continue;
      }
      if (!/\.(?:css|html|js|json|md|mjs|yml)$/i.test(entry.name)) continue;
      output.push([path, await readFile(new URL(entry.name, directory), "utf8")]);
    }
  };
  await visit(root);
  return output;
};

test("project catalog exposes seven complete and uniquely addressable owned cases", async () => {
  const { PROJECTS } = await loadProjects();

  assert.equal(PROJECTS.length, 7);
  assert.equal(new Set(PROJECTS.map(({ slug }) => slug)).size, 7);

  for (const project of PROJECTS) {
    assert.ok(project.slug, "each project needs a stable slug");
    assert.ok(project.title, `${project.slug} needs a title`);
    assert.ok(project.role, `${project.slug} needs role attribution`);
    assert.ok(project.summary, `${project.slug} needs a summary`);
    assert.ok(project.description, `${project.slug} needs an engineering description`);
    assert.ok(project.tags.length >= 4, `${project.slug} needs at least four tags`);
    assert.ok(
      project.highlights.length >= 3,
      `${project.slug} needs at least three engineering highlights`,
    );
    if (project.image) {
      assert.ok(project.imageAlt, `${project.slug} image needs alternative text`);
    }
  }
});

test("homepage feature selection stays explicit and ordered", async () => {
  const { featuredProjects } = await loadProjects();

  assert.deepEqual(
    featuredProjects().map(({ slug }) => slug),
    [
      "lynkvis-ai",
      "enterprise-rag-mcp-assistant",
      "mental-health-platform",
      "sre-copilot",
    ],
  );
});

test("homepage renderer emits only the selected projects with safe text", async () => {
  const { renderFeaturedProjects } = await import("../script.js");
  const markup = renderFeaturedProjects();

  assert.match(markup, /Lynkvis AI 室内设计出图平台/);
  assert.match(markup, /复能助手：企业级 RAG \+ MCP Agent/);
  assert.match(markup, /大白 AI 心理健康平台/);
  assert.match(markup, /智能 SRE 运维助手/);
  assert.doesNotMatch(markup, /电商选品与内容自动化 Agent/);
  assert.doesNotMatch(markup, /生成式内容调度平台/);
  assert.equal((markup.match(/<article class="project"/g) ?? []).length, 4);
});

test("homepage project previews stay concise and keep a direct path to each case", async () => {
  const { renderFeaturedProjects } = await import("../script.js");
  const markup = renderFeaturedProjects();

  assert.equal((markup.match(/class="project-summary"/g) ?? []).length, 4);
  assert.equal((markup.match(/class="project-detail-link"/g) ?? []).length, 4);
  assert.doesNotMatch(markup, /project-highlights/);
  assert.doesNotMatch(markup, /project-tags/);
  assert.ok(
    markup.indexOf("<h3>") < markup.indexOf('class="project-number"'),
    "project name should appear before supporting metadata",
  );
});

test("homepage exposes the refreshed progressive content structure", async () => {
  const html = await read("index.html");

  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="mainContent"/);
  assert.match(html, /class="capability-ticker"/);
  assert.match(html, /id="updatesPreview"/);
  assert.match(html, /type="module" src="\.\/script\.js(?:\?v=[^"]+)?"/);
  assert.match(html, /<noscript>[\s\S]*projects\.html/);
  assert.match(html, /application\/ld\+json/);
});

test("global CSS protects focus, small screens, motion preferences, and page width", async () => {
  const css = await read("styles.css");

  assert.match(css, /overflow-x:\s*clip/);
  assert.doesNotMatch(css, /body\s*\{[^}]*min-width:\s*320px/s);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /\.capability-ticker/);
  assert.match(css, /\.updates-preview/);
});

test("persistent header and lightbox controls keep phone-sized touch targets", async () => {
  const css = await read("styles.css");

  assert.match(css, /\.brand\s*\{[^}]*min-height:\s*44px/s);
  assert.match(css, /\.project-lightbox__close\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/s);
});

test("shared progressive enhancement module is safe outside a browser", async () => {
  const module = await import("../site.js");

  assert.equal(typeof module.setMenuState, "function");
  assert.equal(typeof module.initRevealAnimations, "function");
});

test("global menu owns its scroll lock and closes at the CSS desktop breakpoint", async () => {
  const { initSiteShell, setMenuState } = await import("../site.js");
  const menuToggle = createElement();
  const mainNav = createElement();
  const root = createRoot({ ".menu-toggle": menuToggle, ".main-nav": mainNav });
  let mediaQuery = "";
  let mediaChange;
  const view = {
    matchMedia: (query) => {
      mediaQuery = query;
      return {
        matches: false,
        addEventListener: (_type, listener) => {
          mediaChange = listener;
        },
      };
    },
  };

  initSiteShell(root, view);
  setMenuState(true, { root });

  assert.equal(mediaQuery, "(min-width: 881px)");
  assert.equal(root.body.classList.contains("site-menu-open"), true);
  assert.equal(root.body.classList.contains("docs-menu-open"), false);

  mediaChange({ matches: true });

  assert.equal(mainNav.classList.contains("is-open"), false);
  assert.equal(root.body.classList.contains("site-menu-open"), false);
});

test("docs drawer exposes a visible close state and resets at the desktop breakpoint", async () => {
  const { initDocsShell, setSidebarState } = await import("../docs.js");
  const sidebar = createElement();
  const toggle = createElement();
  const backdrop = createElement();
  const root = createRoot({
    "#docsSidebar": sidebar,
    ".docs-sidebar-toggle": toggle,
    ".docs-backdrop": backdrop,
  });
  let mediaQuery = "";
  let mediaChange;
  const view = {
    matchMedia: (query) => {
      mediaQuery = query;
      return {
        addEventListener: (_type, listener) => {
          mediaChange = listener;
        },
      };
    },
  };

  initDocsShell(root, view);
  setSidebarState(true, { root });

  assert.equal(mediaQuery, "(min-width: 881px)");
  assert.equal(toggle.textContent, "关闭目录 ×");
  assert.equal(toggle.getAttribute("aria-label"), "关闭目录");
  assert.equal(root.body.classList.contains("docs-menu-open"), true);

  root.dispatch("keydown", { key: "Escape" });

  assert.equal(toggle.focused, true);
  assert.equal(sidebar.classList.contains("is-open"), false);

  setSidebarState(true, { root });

  mediaChange({ matches: true });

  assert.equal(sidebar.classList.contains("is-open"), false);
  assert.equal(backdrop.classList.contains("is-visible"), false);
  assert.equal(toggle.textContent, "目录 ☰");
  assert.equal(root.body.classList.contains("docs-menu-open"), false);
});

test("homepage update preview renders three recent static records without remote access", async () => {
  const { renderUpdatesPreview } = await import("../script.js");
  const markup = renderUpdatesPreview({
    schemaVersion: 1,
    issues: [
      { number: 9, title: "第九条", body_text: "第九条正文", created_at: "2026-08-03T00:00:00Z" },
      { number: 8, title: "第八条", body_text: "第八条正文", created_at: "2026-08-02T00:00:00Z" },
      { number: 7, title: "第七条", body_text: "第七条正文", created_at: "2026-08-01T00:00:00Z" },
      { number: 6, title: "不应出现", body_text: "第四条正文", created_at: "2026-07-31T00:00:00Z" },
    ],
  });

  assert.equal((markup.match(/class="updates-preview__item"/g) ?? []).length, 3);
  assert.match(markup, /第九条/);
  assert.match(markup, /第七条/);
  assert.doesNotMatch(markup, /不应出现/);
  assert.match(markup, /updates\.html\?issue=9/);
});

test("homepage empty update preview offers a useful next step", async () => {
  const { renderUpdatesPreview } = await import("../script.js");
  const markup = renderUpdatesPreview({ schemaVersion: 1, issues: [] });

  assert.match(markup, /class="updates-preview__empty-card"/);
  assert.match(markup, /href="\.\/updates\.html"/);
  assert.match(markup, /查看动态同步状态/);
});

test("project index renderer exposes all seven cases and their ownership", async () => {
  const { renderProjectCatalog } = await import("../projects.js");
  const markup = renderProjectCatalog();

  assert.equal((markup.match(/data-project-slug=/g) ?? []).length, 7);
  assert.equal((markup.match(/项目主导者/g) ?? []).length, 4);
  assert.match(markup, /独立全栈开发/);
  assert.match(markup, /独立开发/);
  assert.match(markup, /全栈开发 \/ AI 应用开发/);
  assert.match(markup, /id="lynkvis-ai"/);
  assert.match(markup, /id="content-orchestration"/);
});

test("every declared local project image is available in the static artifact", async () => {
  const { PROJECTS } = await loadProjects();

  for (const { slug, image } of PROJECTS.filter(({ image }) => image)) {
    await assert.doesNotReject(
      access(new URL(`../${image.replace(/^\.\//, "")}`, import.meta.url)),
      `${slug} image must exist`,
    );
  }
});

test("project page provides a progressive catalog mount and no-script path", async () => {
  const html = await read("projects.html");

  assert.match(html, /id="projectCatalog"/);
  assert.match(html, /type="module" src="\.\/projects\.js(?:\?v=[^"]+)?"/);
  assert.match(html, /<noscript>[\s\S]*项目/);
  assert.match(html, /七条真实链路/);
});

test("every public page exposes the same keyboard-accessible shell", async () => {
  const pages = [
    "index.html",
    "projects.html",
    "notes.html",
    "updates.html",
    "about.html",
    "agent-tooling.html",
  ];

  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /class="skip-link"/, `${page} needs a skip link`);
    assert.match(html, /<main[^>]+id="mainContent"/, `${page} needs the shared main target`);
    assert.match(
      html,
      /<script type="module" src="\.\/site\.js"><\/script>/,
      `${page} must load the shared module`,
    );
  }
});

test("public pages keep unique non-empty search descriptions", async () => {
  const pages = [
    "index.html",
    "projects.html",
    "notes.html",
    "updates.html",
    "about.html",
    "agent-tooling.html",
  ];
  const descriptions = [];

  for (const page of pages) {
    const html = await read(page);
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/s)?.[1];
    assert.ok(description?.trim(), `${page} needs a description`);
    descriptions.push(description.trim());
  }

  assert.equal(new Set(descriptions).size, pages.length);
});

test("updates remain generated static data rather than a browser GitHub API client", async () => {
  const [html, script] = await Promise.all([read("updates.html"), read("updates.js")]);

  assert.match(html, /data\/updates-data\.js/);
  assert.match(script, /window\.WUDE_UPDATES_SNAPSHOT/);
  assert.doesNotMatch(script, /api\.github\.com/);
});

test("updates controls remain touch-sized and long content stays contained", async () => {
  const css = await read("updates.css");

  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
});

test("update deep links prioritize the selected note and continue to adjacent notes", async () => {
  const script = await read("updates.js");

  assert.match(
    script,
    /document\.body\.classList\.toggle\("updates-detail-mode", Boolean\(state\.issue\)\)/,
  );
  assert.match(script, /update-detail__neighbors/);
  assert.match(script, /较新一条/);
  assert.match(script, /更早一条/);
  assert.match(script, /阅读全文 →/);
  assert.doesNotMatch(script, /update-detail__neighbor-placeholder/);
  assert.match(script, /slice\(0, currentIndex\)\.reverse\(\)\.find/);
  assert.match(script, /slice\(currentIndex \+ 1\)\.find/);
});

test("public artifact contains no GitHub credential or reference-owner contact data", async () => {
  for (const [name, source] of await publicTextFiles()) {
    assert.doesNotMatch(source, /github_pat_[A-Za-z0-9_]+/, name);
    assert.doesNotMatch(source, /837911722@qq\.com|wmc837911722@gmail\.com/, name);
  }
});

test("Pages workflow still generates the issue snapshot before static deployment", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");

  assert.match(workflow, /branches:\s*\n\s*- main/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /node \.github\/scripts\/sync-issues\.mjs/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test("phone hero keeps each display word intact", async () => {
  const css = await read("styles.css");
  const phoneRules = css.slice(css.lastIndexOf("@media (max-width: 760px)"));

  assert.match(phoneRules, /\.hero h1\s*\{[\s\S]*?word-break:\s*normal/);
  assert.match(phoneRules, /\.hero h1\s*>\s*\*\s*\{[\s\S]*?white-space:\s*nowrap/);
});
