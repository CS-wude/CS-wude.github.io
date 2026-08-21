import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("project catalog lets visitors scan seven cases before opening details", async () => {
  const { renderProjectCatalog } = await import("../projects.js");
  const catalog = renderProjectCatalog();

  assert.equal((catalog.match(/<details class="project-index__details">/g) ?? []).length, 7);
  assert.equal((catalog.match(/查看职责与关键链路/g) ?? []).length, 7);
  assert.doesNotMatch(catalog, /<details class="project-index__details" open>/);

  const firstCase = catalog.slice(0, catalog.indexOf('<article class="project-index__item"', 1));
  const detailsIndex = firstCase.indexOf('<details class="project-index__details">');
  const imageIndex = firstCase.search(/class="project-index__visual/);
  assert.ok(detailsIndex >= 0 && imageIndex > detailsIndex, "large media belongs to expanded details");
});

test("project catalog opens and scrolls to a case rendered after initial hash navigation", async () => {
  const { initProjectCatalog } = await import("../projects.js");
  const catalog = { innerHTML: "" };
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
    querySelector: (selector) => (selector === "#projectCatalog" ? catalog : null),
  };
  const view = {
    location: { hash: "#enterprise-rag-mcp-assistant" },
    requestAnimationFrame: (callback) => callback(),
  };

  initProjectCatalog(root, view);

  assert.equal(details.open, true);
  assert.deepEqual(scrollOptions, { block: "start" });
});

test("same-page project shortcuts expand the newly selected hash target", async () => {
  const { initProjectCatalog } = await import("../projects.js");
  const catalog = { innerHTML: "" };
  const details = { open: false };
  let scrollCount = 0;
  let hashChange = null;
  const target = {
    querySelector: (selector) => (selector === ".project-index__details" ? details : null),
    scrollIntoView: () => {
      scrollCount += 1;
    },
  };
  const root = {
    getElementById: (id) => (id === "sre-copilot" ? target : null),
    querySelector: (selector) => (selector === "#projectCatalog" ? catalog : null),
  };
  const view = {
    location: { hash: "" },
    requestAnimationFrame: (callback) => callback(),
    addEventListener: (name, callback) => {
      if (name === "hashchange") hashChange = callback;
    },
  };

  initProjectCatalog(root, view);
  view.location.hash = "#sre-copilot";
  hashChange?.();

  assert.equal(typeof hashChange, "function");
  assert.equal(details.open, true);
  assert.equal(scrollCount, 1);
});

test("project page puts the case catalog before supporting context without a duplicate index", async () => {
  const html = await read("projects.html");
  const catalogIndex = html.indexOf('id="selected-projects"');
  const contextIndex = html.indexOf('id="my-part"');

  assert.match(html, /<body[^>]+class="projects-page"/);
  assert.doesNotMatch(html, /id="projectJumpList"/);
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

test("project masthead stays subordinate to the project catalog", async () => {
  const css = await read("docs.css");
  const desktopRule = css.match(
    /\.projects-page \.article-header h1\s*{[^}]*font-size:\s*clamp\([^,]+,\s*([\d.]+)vw,\s*([\d.]+)rem\)/s,
  );
  const phoneCss = css.slice(css.lastIndexOf("@media (max-width: 640px)"));
  const phoneRule = phoneCss.match(
    /\.projects-page \.article-header h1\s*{[^}]*font-size:\s*clamp\([^,]+,\s*([\d.]+)vw,\s*([\d.]+)rem\)/s,
  );

  assert.ok(desktopRule && Number(desktopRule[1]) <= 5.6 && Number(desktopRule[2]) <= 4.8);
  assert.ok(phoneRule && Number(phoneRule[1]) <= 11.5 && Number(phoneRule[2]) <= 3.5);
});
