import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

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
