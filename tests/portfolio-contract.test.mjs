import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const loadProjects = () => import("../data/projects.js");
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

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
