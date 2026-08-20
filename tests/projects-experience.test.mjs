import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("project catalog lets visitors scan seven cases before opening details", async () => {
  const { renderProjectCatalog, renderProjectJumpList } = await import("../projects.js");
  const catalog = renderProjectCatalog();
  const jumpList = renderProjectJumpList();

  assert.equal((jumpList.match(/class="project-jump__item"/g) ?? []).length, 7);
  assert.match(jumpList, /href="#lynkvis-ai"/);
  assert.match(jumpList, /href="#content-orchestration"/);
  assert.equal((catalog.match(/<details class="project-index__details">/g) ?? []).length, 7);
  assert.equal((catalog.match(/查看职责与关键链路/g) ?? []).length, 7);
  assert.doesNotMatch(catalog, /<details class="project-index__details" open>/);
});

test("project catalog opens and scrolls to a case rendered after initial hash navigation", async () => {
  const { initProjectCatalog } = await import("../projects.js");
  const catalog = { innerHTML: "" };
  const jumpList = { innerHTML: "" };
  const details = { open: false };
  let scrollOptions = null;
  const target = {
    querySelector: (selector) => (selector === ".project-index__details" ? details : null),
    scrollIntoView: (options) => {
      scrollOptions = options;
    },
  };
  const root = {
    getElementById: (id) => (id === "enterprise-rag-mcp-assistant" ? target : null),
    querySelector: (selector) =>
      selector === "#projectCatalog" ? catalog : selector === "#projectJumpList" ? jumpList : null,
  };
  const view = {
    location: { hash: "#enterprise-rag-mcp-assistant" },
    requestAnimationFrame: (callback) => callback(),
  };

  initProjectCatalog(root, view);

  assert.equal(details.open, true);
  assert.deepEqual(scrollOptions, { block: "start" });
});

test("project page puts a compact index before the case catalog and supporting context", async () => {
  const html = await read("projects.html");
  const jumpIndex = html.indexOf('id="projectJumpList"');
  const catalogIndex = html.indexOf('id="selected-projects"');
  const contextIndex = html.indexOf('id="my-part"');

  assert.match(html, /<body[^>]+class="projects-page"/);
  assert.ok(jumpIndex > 0, "project page needs the quick index mount");
  assert.ok(jumpIndex < catalogIndex, "quick index must appear before the case catalog");
  assert.ok(catalogIndex < contextIndex, "case catalog must appear before supporting context");
  assert.doesNotMatch(html, /archive-visual/);
});

test("closed project details remain visually collapsed despite the custom grid layout", async () => {
  const css = await read("docs.css");

  assert.match(
    css,
    /\.project-index__details:not\(\[open\]\)\s*>\s*\.project-index__details-body\s*{[^}]*display:\s*none/s,
  );
});

test("project page versions its page-specific assets to prevent mixed deployments", async () => {
  const html = await read("projects.html");

  assert.match(html, /href="\.\/docs\.css\?v=[^"]+"/);
  assert.match(html, /src="\.\/projects\.js\?v=[^"]+"/);
});
