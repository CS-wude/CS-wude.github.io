# WUDE Portfolio Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the WUDE static portfolio with a stronger editorial interface, seven owned project cases, resilient GitHub-updates integration, and verified mobile layouts while preserving the original personal engineering voice.

**Architecture:** Keep the existing top-level static pages and GitHub Pages workflow. Introduce a browser/Node-compatible project data module, render project collections through focused page scripts, and use progressive native-JavaScript enhancements with CSS fallbacks. Add dependency-free Node contract tests so the site remains easy to maintain.

**Tech Stack:** HTML5, CSS custom properties and responsive layout, native ES modules, Node.js built-in test runner, Python static HTTP server, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-08-20-portfolio-refresh-design.md`

## Global Constraints

- Keep the site positioned as a personal technical blog and engineering portfolio.
- Preserve `.github/scripts/sync-issues.mjs`, `data/updates.json`, `data/updates-data.js`, and the current GitHub Pages data flow.
- Do not expose or persist any GitHub token.
- Do not push commits, branches, deployments, pull requests, or repository settings to GitHub.
- Keep `main` unchanged; all commits stay on local branch `feat/portfolio-refresh`.
- Support 360px phone, 768px tablet, and 1440px desktop layouts without page-level horizontal overflow.
- Respect `prefers-reduced-motion: reduce` and keep core content usable without JavaScript.

---

### Task 1: Add a dependency-free contract test harness and canonical project data

**Files:**
- Create: `package.json`
- Create: `tests/portfolio-contract.test.mjs`
- Create: `data/projects.js`
- Modify: `script.js`

**Interfaces:**
- Produces: `PROJECTS: ReadonlyArray<Project>` exported from `data/projects.js`.
- Produces: `featuredProjects(): Project[]` exported from `data/projects.js`.
- `Project` fields: `slug`, `title`, `category`, `period`, `role`, `summary`, `description`, `highlights`, `tags`, `image`, `imageAlt`, `imageRatio`, `color`, `visual`, `featured`.
- Consumes: no runtime dependencies and no network access.

- [ ] **Step 1: Write the failing project-data tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { PROJECTS, featuredProjects } from "../data/projects.js";

test("project catalog contains seven unique owned cases", () => {
  assert.equal(PROJECTS.length, 7);
  assert.equal(new Set(PROJECTS.map(({ slug }) => slug)).size, 7);
  for (const project of PROJECTS) {
    assert.ok(project.title && project.role && project.summary);
    assert.ok(project.tags.length >= 4);
    assert.ok(project.highlights.length >= 3);
    if (project.image) assert.ok(project.imageAlt);
  }
});

test("homepage feature selection is explicit and stable", () => {
  assert.deepEqual(
    featuredProjects().map(({ slug }) => slug),
    ["lynkvis-ai", "enterprise-rag-mcp-assistant", "mental-health-platform", "sre-copilot"],
  );
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/portfolio-contract.test.mjs`

Expected: FAIL because `data/projects.js` does not exist.

- [ ] **Step 3: Add the module and migrate homepage rendering**

Create seven complete records in `data/projects.js`, using the approved role statements and owned image paths. Export a frozen catalog and this selector:

```js
export const featuredProjects = () => PROJECTS.filter(({ featured }) => featured);
```

Change `script.js` to import `featuredProjects`, retain HTML escaping and the accessible dialog, and render only the explicit homepage selection. Add `package.json`:

```json
{
  "name": "wude-portfolio",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs"
  }
}
```

- [ ] **Step 4: Run the test and syntax checks**

Run: `node --test tests/portfolio-contract.test.mjs && node --check data/projects.js && node --check script.js`

Expected: 2 tests pass and both syntax checks exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json tests/portfolio-contract.test.mjs data/projects.js script.js
git commit -m "feat: centralize portfolio project data"
```

### Task 2: Rebuild the homepage information hierarchy and visual system

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `site.js`
- Modify: `script.js`
- Modify: `tests/portfolio-contract.test.mjs`

**Interfaces:**
- Consumes: `featuredProjects()` from Task 1.
- Produces DOM hooks: `#mainContent`, `#projects`, `#updatesPreview`, `.capability-ticker`, `[data-reveal]`, `.menu-toggle`, `#mainNav`.
- Produces CSS tokens: `--paper`, `--ink`, `--blue`, `--acid`, `--coral`, `--line`, `--muted`.

- [ ] **Step 1: Add failing homepage structure tests**

```js
test("homepage exposes the refreshed progressive structure", async () => {
  const html = await read("index.html");
  assert.match(html, /class="skip-link"/);
  assert.match(html, /id="mainContent"/);
  assert.match(html, /class="capability-ticker"/);
  assert.match(html, /id="updatesPreview"/);
  assert.match(html, /type="module" src="\.\/script\.js"/);
  assert.match(html, /<noscript>[\s\S]*projects\.html/);
});

test("global CSS contains required responsive and motion safeguards", async () => {
  const css = await read("styles.css");
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:\s*44px/);
});
```

- [ ] **Step 2: Run the homepage tests and verify failure**

Run: `node --test tests/portfolio-contract.test.mjs`

Expected: FAIL on the missing skip link, ticker, preview, module script, and responsive safeguards.

- [ ] **Step 3: Implement the homepage and global progressive enhancements**

Update `index.html` with canonical/Open Graph metadata, JSON-LD, skip link, refreshed hero, capability ticker, featured project heading, four engineering principles, latest-updates preview, and stable no-script links. Update `site.js` so menu state closes on link activation/Escape/desktop breakpoint and reveal animations only initialize when motion is allowed. Update `script.js` to render four feature cases, enhance the image dialog, and render three recent entries from `window.WUDE_UPDATES_SNAPSHOT` without fetching GitHub.

- [ ] **Step 4: Implement the visual tokens and responsive layouts**

Refactor `styles.css` around the declared tokens. Use fluid `clamp()` typography, two-column editorial layouts above 760px, one-column project layouts below 760px, contained media, 44px control targets, visible focus rings, and reduced-motion overrides. Keep enhancement content visible when `.js` or animation APIs are unavailable.

- [ ] **Step 5: Run tests and verify syntax**

Run: `node --test tests/portfolio-contract.test.mjs && node --check site.js && node --check script.js`

Expected: all tests pass and syntax checks exit 0.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css site.js script.js tests/portfolio-contract.test.mjs
git commit -m "feat: refresh portfolio homepage"
```

### Task 3: Expand the project index to seven owned cases

**Files:**
- Create: `projects.js`
- Modify: `projects.html`
- Modify: `docs.css`
- Modify: `tests/portfolio-contract.test.mjs`
- Create: `assets/projects/lynkvis-ai-live.webp`
- Create: `assets/projects/ecommerce-research-agent.webp`
- Create: `assets/projects/enterprise-rag-mcp-assistant.webp`

**Interfaces:**
- Consumes: `PROJECTS` from `data/projects.js`.
- Produces DOM hooks: `#projectCatalog`, `[data-project-slug]`, `.project-index__role`, `.project-index__highlights`.
- Asset paths match `Project.image` values and are local relative URLs.

- [ ] **Step 1: Add failing project-index and asset tests**

```js
test("project index renders from the canonical catalog", async () => {
  const [html, script] = await Promise.all([read("projects.html"), read("projects.js")]);
  assert.match(html, /id="projectCatalog"/);
  assert.match(html, /type="module" src="\.\/projects\.js"/);
  assert.match(script, /import \{ PROJECTS \} from "\.\/data\/projects\.js"/);
  assert.match(script, /data-project-slug/);
});

test("all declared local project images exist", async () => {
  for (const { image } of PROJECTS.filter(({ image }) => image)) {
    await access(new URL(`../${image.replace(/^\.\//, "")}`, import.meta.url));
  }
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `node --test tests/portfolio-contract.test.mjs`

Expected: FAIL because `projects.js`, `#projectCatalog`, and the three new local assets are absent.

- [ ] **Step 3: Copy and optimize owned assets**

Copy the three approved reference assets into `assets/projects/` under the exact names above. Preserve aspect ratio and use WebP for the new conceptual images. Do not copy reference contact imagery, logos, metadata, commercial copy, or deployment files.

- [ ] **Step 4: Implement the data-driven project index**

Replace the four hard-coded index items with a stable `#projectCatalog` progressive container and a no-script summary. Add `projects.js` to render all seven cases with role attribution, engineering summary, three highlights, and technology tags using escaped text. Update the page heading from “四个项目” to “七个项目，七条真实链路.”

- [ ] **Step 5: Add responsive project-index styling**

Update `docs.css` so case headers, role badges, highlights, and tags remain readable at 360px. Make `.doc-table` scroll within its own wrapper or convert it to stacked rows without adding page overflow.

- [ ] **Step 6: Run tests and syntax checks**

Run: `node --test tests/portfolio-contract.test.mjs && node --check projects.js`

Expected: all tests pass and `projects.js` syntax exits 0.

- [ ] **Step 7: Commit**

```bash
git add projects.html projects.js docs.css assets/projects tests/portfolio-contract.test.mjs
git commit -m "feat: expand owned project catalog"
```

### Task 4: Align secondary pages and preserve the updates experience

**Files:**
- Modify: `about.html`
- Modify: `agent-tooling.html`
- Modify: `notes.html`
- Modify: `projects.html`
- Modify: `updates.html`
- Modify: `docs.css`
- Modify: `updates.css`
- Modify: `tests/portfolio-contract.test.mjs`

**Interfaces:**
- Consumes: shared `.site-header`, `.main-nav`, `.site-footer`, `.skip-link`, and `site.js` behavior.
- Preserves: all current page URLs, update query parameters, snapshot source validation, search, label filters, pagination, detail view, and sanitized GitHub-rendered HTML.

- [ ] **Step 1: Add failing shared-shell and update-contract tests**

```js
test("every public page has a skip link, main id, and unique description", async () => {
  const pages = ["index.html", "projects.html", "notes.html", "updates.html", "about.html", "agent-tooling.html"];
  const descriptions = new Set();
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /class="skip-link"/);
    assert.match(html, /<main[^>]+id="mainContent"/);
    const description = html.match(/<meta name="description" content="([^"]+)"/s)?.[1];
    assert.ok(description);
    descriptions.add(description);
  }
  assert.equal(descriptions.size, pages.length);
});

test("updates remain static-snapshot driven", async () => {
  const [html, script, workflow, sync] = await Promise.all([
    read("updates.html"), read("updates.js"), read(".github/workflows/deploy-pages.yml"), read(".github/scripts/sync-issues.mjs"),
  ]);
  assert.match(html, /data\/updates-data\.js/);
  assert.match(script, /window\.WUDE_UPDATES_SNAPSHOT/);
  assert.doesNotMatch(script, /api\.github\.com/);
  assert.match(workflow, /Generate GitHub Issues snapshot/);
  assert.match(sync, /process\.env\.GITHUB_TOKEN/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/portfolio-contract.test.mjs`

Expected: FAIL because secondary pages do not yet share the skip-link/main-id contract.

- [ ] **Step 3: Align shared markup without rewriting content**

Add the skip link and `id="mainContent"` to all secondary pages, normalize current navigation markers, and align their footer shell. Preserve article text, section anchors, update forms, dialog/detail behavior, and URLs.

- [ ] **Step 4: Align responsive CSS**

Update `docs.css` and `updates.css` to use the refreshed color tokens, focus treatment, header height, fluid spacing, and phone-safe controls. Contain markdown tables, code blocks, long links, filters, and pagination within the viewport.

- [ ] **Step 5: Run the full test suite and syntax checks**

Run: `node --test tests/*.test.mjs && node --check site.js && node --check docs.js && node --check updates.js && node --check .github/scripts/sync-issues.mjs`

Expected: all tests pass and all syntax checks exit 0.

- [ ] **Step 6: Commit**

```bash
git add about.html agent-tooling.html notes.html projects.html updates.html docs.css updates.css tests/portfolio-contract.test.mjs
git commit -m "feat: align responsive secondary pages"
```

### Task 5: Verify Actions preservation, local serving, responsive behavior, and security

**Files:**
- Modify: `tests/portfolio-contract.test.mjs`
- Modify: `README.md`
- Modify: any implementation file only when verification identifies a defect.

**Interfaces:**
- Consumes: the complete static site and checked-in snapshot data.
- Produces: passing automated checks and a live local preview URL.

- [ ] **Step 1: Add failing repository integrity tests**

```js
test("site contains no committed credential or reference-owner contact data", async () => {
  const files = await publicTextFiles();
  for (const [name, source] of files) {
    assert.doesNotMatch(source, /github_pat_[A-Za-z0-9_]+/, name);
    assert.doesNotMatch(source, /837911722@qq\.com|wmc837911722@gmail\.com/, name);
  }
});

test("workflow contract remains deployable", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");
  assert.match(workflow, /branches:\s*\n\s*- main/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /node \.github\/scripts\/sync-issues\.mjs/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
```

- [ ] **Step 2: Run the suite and correct any integrity failures**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass after removing only unintended secrets/reference-owner contact data. WUDE's existing public contact link remains.

- [ ] **Step 3: Update maintenance documentation**

Document the seven-project catalog, `npm test`, local preview command, Actions snapshot flow, and the fact that GitHub Pages still deploys only from `main`. Do not document any token value.

- [ ] **Step 4: Start the local server and run HTTP smoke checks**

Run: `python -m http.server 4173 --bind 127.0.0.1`

Then verify HTTP 200 for `/`, `/projects.html`, `/updates.html`, `/about.html`, `/data/projects.js`, and every declared image asset.

- [ ] **Step 5: Run browser acceptance at target widths**

At widths 360, 768, and 1440, inspect `/`, `/projects.html`, `/updates.html`, and `/about.html`. Verify:

- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`;
- mobile menu opens, announces expanded state, closes on Escape, and restores focus;
- project images and cards remain contained;
- updates search/filter controls remain usable;
- no site-authored console errors;
- reduced-motion mode leaves content visible.

- [ ] **Step 6: Run final verification and review diff**

Run: `npm test`, all JavaScript syntax checks, `git diff --check`, `git status --short --branch`, and `git diff main...HEAD --stat`.

Expected: all checks pass; branch is `feat/portfolio-refresh`; only intended local files are changed; no remote ref has been created.

- [ ] **Step 7: Commit**

```bash
git add README.md tests/portfolio-contract.test.mjs
git commit -m "test: verify portfolio delivery"
```
