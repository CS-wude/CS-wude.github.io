import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("project navigation exposes every case without a second catalog", async () => {
  const { renderDocsNavigation } = await import("../docs.js");

  assert.equal(typeof renderDocsNavigation, "function");

  const markup = renderDocsNavigation({ currentPage: "overview", headings: [] });

  assert.equal((markup.match(/data-project-link/g) ?? []).length, 7);
  assert.match(markup, /href="\.\/projects\.html#lynkvis-ai"/);
  assert.match(markup, /href="\.\/projects\.html#content-orchestration"/);
  assert.doesNotMatch(
    markup,
    /<details class="docs-group docs-group--current" open>/,
    "project shortcuts should stay available without duplicating the open catalog",
  );
});

test("content navigation includes every current-page heading and every site destination", async () => {
  const { renderDocsNavigation } = await import("../docs.js");
  const headings = [
    { id: "leading", text: "组长不是队里最忙的程序员", level: "2" },
    { id: "ai-responsibility", text: "AI 可以代写代码，不能代签责任", level: "2" },
    { id: "delivery", text: "部署脚本也是项目的一部分", level: "2" },
  ];

  assert.equal(typeof renderDocsNavigation, "function");

  const markup = renderDocsNavigation({ currentPage: "notes", headings });

  for (const href of [
    "./projects.html",
    "./agent-tooling.html",
    "./notes.html",
    "./index.html",
    "./updates.html",
    "./about.html",
    "#leading",
    "#ai-responsibility",
    "#delivery",
  ]) {
    assert.ok(markup.includes('href="' + href + '"'), href);
  }
});

test("page routes form a complete reading path instead of skipping destinations", async () => {
  const { renderPageRoute } = await import("../page-route.js");

  assert.equal(typeof renderPageRoute, "function");

  const expected = {
    overview: ["./index.html", "./agent-tooling.html"],
    "case-study": ["./projects.html", "./notes.html"],
    notes: ["./agent-tooling.html", "./updates.html"],
    updates: ["./notes.html", "./about.html"],
    about: ["./updates.html", "./index.html"],
  };

  for (const [page, hrefs] of Object.entries(expected)) {
    const markup = renderPageRoute(page);
    assert.deepEqual(
      [...markup.matchAll(/href="([^"]+)"/g)].map(([, href]) => href),
      hrefs,
      page,
    );
  }
});

test("static content pages mount one shared directory and avoid repeated preview indexes", async () => {
  const pages = ["projects.html", "agent-tooling.html", "notes.html", "about.html"];

  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /data-docs-navigation/, page + " needs the shared directory mount");
    assert.match(html, /data-page-route/, page + " needs the shared page route mount");
    assert.doesNotMatch(html, /class="page-toc"/, page + " must not render a third navigation rail");
  }

  assert.doesNotMatch(await read("projects.html"), /id="projectJumpList"/);
  assert.doesNotMatch(await read("notes.html"), /class="article-figure notes-visual"/);
});

test("desktop content shells leave most of the viewport to reading", async () => {
  const css = await read("docs.css");
  const railWidths = [
    ...css.matchAll(
      /(?:\.projects-page\s+)?\.docs-layout\s*{[^}]*grid-template-columns:\s*(\d+)px\s+minmax\(0,\s*1fr\)/gs,
    ),
  ].map(([, width]) => Number(width));

  assert.ok(railWidths.length >= 2, "base and project shells should declare their secondary rail");
  assert.ok(railWidths.every((width) => width <= 240), `secondary rails are too wide: ${railWidths}`);
});
