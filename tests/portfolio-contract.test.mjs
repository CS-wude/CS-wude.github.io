import assert from "node:assert/strict";
import test from "node:test";

const loadProjects = () => import("../data/projects.js");

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
