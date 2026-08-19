import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const loadProjects = () => import("../data/projects.js");
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

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

test("homepage exposes the refreshed progressive content structure", async () => {
  const html = await read("index.html");

  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="mainContent"/);
  assert.match(html, /class="capability-ticker"/);
  assert.match(html, /id="updatesPreview"/);
  assert.match(html, /type="module" src="\.\/script\.js"/);
  assert.match(html, /<noscript>[\s\S]*projects\.html/);
  assert.match(html, /application\/ld\+json/);
});

test("global CSS protects focus, small screens, motion preferences, and page width", async () => {
  const css = await read("styles.css");

  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /\.capability-ticker/);
  assert.match(css, /\.updates-preview/);
});

test("shared progressive enhancement module is safe outside a browser", async () => {
  const module = await import("../site.js");

  assert.equal(typeof module.setMenuState, "function");
  assert.equal(typeof module.initRevealAnimations, "function");
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
  assert.match(html, /type="module" src="\.\/projects\.js"/);
  assert.match(html, /<noscript>[\s\S]*项目/);
  assert.match(html, /七个项目，七条真实链路/);
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
