import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const createElement = () => {
  const attributes = new Map();
  const classes = new Set();

  return {
    hidden: false,
    textContent: "",
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      contains: (name) => classes.has(name),
      toggle: (name, force) => {
        if (force) classes.add(name);
        else classes.delete(name);
      },
    },
    addEventListener: () => {},
    focus: () => {},
    getAttribute: (name) => attributes.get(name) ?? null,
    removeAttribute: (name) => attributes.delete(name),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    toggleAttribute: (name, force) => {
      if (force) attributes.set(name, "");
      else attributes.delete(name);
    },
  };
};

const createNavigationRoot = ({ menuToggle, mainNav, docsToggle }) => ({
  body: { classList: createElement().classList },
  documentElement: createElement(),
  querySelector: (selector) =>
    ({
      ".menu-toggle": menuToggle,
      ".main-nav": mainNav,
      ".docs-sidebar-toggle": docsToggle,
    })[selector] ?? null,
  querySelectorAll: () => [],
  addEventListener: () => {},
});

test("every public page loads the Vault theme after its page styles", async () => {
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
    const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)" \/>/g)].map(
      ([, href]) => href,
    );

    assert.match(styles.at(-1) ?? "", /^\.\/vault\.css\?v=[a-z0-9-]+$/i, page);
  }
});

test("Vault mobile typography keeps every hero display word intact", async () => {
  const css = await read("vault.css");
  const mobile = css.slice(css.lastIndexOf("@media (max-width: 520px)"));

  assert.match(mobile, /\.hero h1\s*{[^}]*overflow-wrap:\s*normal[^}]*word-break:\s*normal/s);
  assert.match(mobile, /\.hero h1\s*>\s*\*\s*{[^}]*white-space:\s*nowrap/s);
});

test("Vault tablet navigation keeps a full touch-sized menu control", async () => {
  const css = await read("vault.css");
  const tablet = css.slice(
    css.indexOf("@media (max-width: 880px)"),
    css.indexOf("@media (max-width: 520px)"),
  );

  assert.match(tablet, /\.menu-toggle\s*{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s);
});

test("Vault mobile navigation and footer links expose touch-sized hit areas", async () => {
  const css = await read("vault.css");
  const tablet = css.slice(
    css.indexOf("@media (max-width: 880px)"),
    css.indexOf("@media (max-width: 520px)"),
  );

  assert.match(
    tablet,
    /\.docs-group summary,\s*\.docs-group a\s*{[^}]*min-height:\s*44px/s,
  );
  assert.match(tablet, /\.site-footer a\s*{[^}]*min-height:\s*44px/s);
});

test("docs pages yield the global menu button to their single navigation control", async () => {
  const { initSiteShell } = await import("../site.js");
  const menuToggle = createElement();
  const docsToggle = createElement();
  const root = createNavigationRoot({ menuToggle, mainNav: createElement(), docsToggle });
  const view = { matchMedia: () => ({ addEventListener: () => {} }) };

  initSiteShell(root, view);

  assert.equal(menuToggle.hidden, true);
  assert.equal(menuToggle.getAttribute("aria-hidden"), "true");
  assert.equal(docsToggle.hidden, false);
});

test("author styles preserve the hidden global menu control on content pages", async () => {
  const css = await read("vault.css");

  assert.match(
    css,
    /\.menu-toggle\[hidden\]\s*{[^}]*display:\s*none\s*!important/s,
    "the mobile display rule must not override the hidden attribute",
  );
});

test("closed mobile directory leaves the keyboard and accessibility trees", async () => {
  const { setSidebarState } = await import("../docs.js");
  const sidebar = createElement();
  const toggle = createElement();
  const backdrop = createElement();
  const root = {
    body: { classList: createElement().classList },
    querySelector: (selector) =>
      ({
        "#docsSidebar": sidebar,
        ".docs-sidebar-toggle": toggle,
        ".docs-backdrop": backdrop,
      })[selector] ?? null,
  };

  setSidebarState(false, { root, conceal: true });
  assert.equal(sidebar.getAttribute("inert"), "");
  assert.equal(sidebar.getAttribute("aria-hidden"), "true");

  setSidebarState(true, { root, conceal: true });
  assert.equal(sidebar.getAttribute("inert"), null);
  assert.equal(sidebar.getAttribute("aria-hidden"), null);

  setSidebarState(false, { root, conceal: false });
  assert.equal(sidebar.getAttribute("inert"), null);
  assert.equal(sidebar.getAttribute("aria-hidden"), null);
});

test("homepage Vault layer keeps the ticker readable and project previews compact", async () => {
  const css = await read("vault.css");
  const mobile = css.slice(css.indexOf("@media (max-width: 880px)"));

  assert.match(
    css,
    /\.capability-ticker\s*{[^}]*background:\s*var\(--vault-ink\)[^}]*color:\s*var\(--vault-card\)/s,
  );
  assert.match(
    css,
    /\.project-list\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(
    css,
    /\.project-list\s+\.project-visual\s*{[^}]*aspect-ratio:\s*21\s*\/\s*9/s,
  );
  assert.match(mobile, /\.project-list\s*{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /\.updates-preview:has\(\.updates-preview__empty-card\)/);
});

test("homepage phone hero fits its first viewport without crowding the actions", async () => {
  const css = await read("vault.css");
  const phone = css.slice(
    css.indexOf("@media (max-width: 520px)"),
    css.indexOf("@media (min-width: 700px)"),
  );

  assert.match(phone, /\.hero-layout\s*{[^}]*gap:\s*28px[^}]*padding-block:\s*28px\s+22px/s);
  assert.match(phone, /\.hero-actions\s*{[^}]*margin-top:\s*22px/s);
});

test("homepage landscape keeps compact project previews in two columns", async () => {
  const css = await read("vault.css");
  const landscape = css.slice(css.indexOf("@media (min-width: 700px)"));

  assert.match(
    landscape,
    /\.project-list\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
});

test("homepage empty update heading avoids a desktop orphan line", async () => {
  const css = await read("vault.css");

  assert.match(
    css,
    /\.updates-preview:has\(\.updates-preview__empty-card\) h2\s*{[^}]*font-size:\s*clamp\(2\.6rem,\s*4\.2vw,\s*4\.4rem\)/s,
  );
});
