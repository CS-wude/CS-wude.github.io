# WUDE Portfolio Refresh Design

## Goal

Upgrade the existing WUDE personal engineering blog into a stronger, more polished portfolio while preserving its original technical tone, static architecture, GitHub Issues snapshot workflow, and GitHub Pages deployment model.

## Product Positioning

The site remains a personal technical blog and engineering portfolio. It must not adopt the reference site's commercial-services framing. The refreshed experience should communicate three things quickly:

1. WUDE works across Java backend, AI application engineering, and platform delivery.
2. WUDE leads complete system flows and makes explicit reliability and recovery trade-offs.
3. The site contains substantive project cases, technical notes, and continuously synced workbench updates.

All added case studies are projects led by WUDE. Team-project language must still distinguish leadership and contribution from single-person authorship, and existing confidentiality boundaries remain in force.

## Chosen Approach

Keep the current native HTML, CSS, and JavaScript architecture. Borrow visual and interaction patterns from the reference site—editorial typography, strong section numbering, bright accent blocks, structured case presentation, restrained reveal motion, and clearer calls to action—without copying its React/Vite stack or commercial copy.

This approach is preferred over a React migration because it preserves the site's low maintenance cost, keeps the current Actions pipeline stable, and allows the existing static Pages artifact to remain directly inspectable. It is preferred over a CSS-only reskin because the requested improvement also needs better information architecture, reusable project data, accessibility, testing, and responsive behavior.

## Architecture

### Static application

- Existing top-level HTML pages remain the public URLs.
- Shared navigation, footer behavior, menu behavior, current year, scroll reveal, and progressive enhancements live in focused native JavaScript modules.
- Project metadata moves to a single static data source consumed by both the homepage and project index.
- Pages render useful fallback content in HTML and enhance it with JavaScript; a script failure must not leave the primary navigation or project information inaccessible.

### Content and project model

The project model includes:

- stable slug and sequence number;
- title, period, short summary, and long engineering description;
- role/ownership statement;
- technology tags;
- reliability or system-design highlights;
- optional image and accessible image description;
- optional case-detail link.

The current four core projects remain. The additional owned cases from the reference repository are added where their source material is complete enough to support an honest, useful project entry. Images owned by WUDE may be copied into this repository and optimized for static delivery. No reference-site contact information, commercial wording, tracking setup, or unrelated platform code is imported.

### GitHub updates data flow

The following behavior is preserved:

```text
GitHub Actions schedule/push
  -> .github/scripts/sync-issues.mjs
  -> data/updates.json + data/updates-data.js
  -> static updates.html rendering
  -> Pages artifact deployment
```

The workflow and sync script keep their current environment variable contract. Frontend changes may improve the presentation of synced updates but may not introduce browser-side GitHub API calls or expose tokens.

## Page Design

### Global shell

- Keep the WUDE wordmark and concise Chinese navigation.
- Use a sticky compact header with a high-contrast mobile menu.
- Use a warm paper background, ink foreground, electric blue as the main accent, and a small acid-green accent for status/technical signals.
- Maintain an editorial mix of oversized display text, compact uppercase metadata, visible rules, and technical annotations.
- Add a visible keyboard focus style and a skip link.

### Homepage

1. Hero: retain “WUDE” and the software engineer/tech lead identity, but improve hierarchy and add a concise engineering-positioning statement.
2. Capability ticker: Java backend, AI applications, distributed systems, Agent/MCP, cloud-native delivery, and technical leadership.
3. Featured projects: a responsive, data-driven selection with project number, ownership, summary, tags, and visual.
4. Engineering principles: preserve the original state/event/call-chain voice and turn it into scannable principles.
5. Latest updates preview: show recent entries from the generated static snapshot and link to the full updates page.
6. Footer: keep the understated “keep building” tone and direct links to projects, notes, updates, GitHub, and email where already present.

### Project index

- Preserve the documentation-style page structure.
- Expand the project index to all approved owned cases.
- Make role, system boundary, failure/recovery concerns, and technology choices easy to scan.
- Use owned project imagery where it materially explains the system; otherwise use CSS-native technical diagrams instead of decorative stock assets.

### Notes, updates, about, and article pages

- Keep their existing content and URLs.
- Align header, spacing, typography, focus state, mobile navigation, and footer with the refreshed shell.
- Preserve update search/filter behavior and the static snapshot fallback.

## Interaction Design

- Use `IntersectionObserver` for lightweight reveal animations.
- Keep all content visible when JavaScript is unavailable or animation initialization fails.
- Respect `prefers-reduced-motion: reduce`; disable nonessential movement and smooth scrolling.
- The mobile menu manages `aria-expanded`, closes after navigation, closes on Escape, and prevents obscured keyboard focus.
- Project imagery may use an accessible native dialog/lightbox only if the interaction adds real inspection value.
- Avoid autoplay media, scroll-jacking, cursor-following effects, or heavyweight animation dependencies.

## Responsive Requirements

- Small phone target: 360 CSS pixels wide.
- Tablet target: 768 CSS pixels wide.
- Desktop target: 1440 CSS pixels wide.
- No horizontal document overflow at any target.
- Navigation and primary actions have at least a 44 by 44 CSS pixel touch target where they are icon-only or compact controls.
- Typography uses bounded fluid sizing so hero and project titles do not break CJK or Latin words outside the viewport.
- Project layouts collapse to one column on phones, with text preceding nonessential visuals.
- Dense tables become horizontally contained or convert to stacked rows without forcing page-level overflow.

## Accessibility and Metadata

- Semantic landmarks and heading order remain valid.
- All meaningful project images receive contextual alternative text; decorative graphics are hidden from assistive technology.
- Color contrast targets WCAG AA for body text and controls.
- Focus is visible on links, buttons, search controls, filters, and the mobile menu.
- Each page keeps a unique title and description.
- The homepage adds canonical/Open Graph metadata and Person/WebSite structured data using only verified WUDE information already present in the repository.

## Failure Handling

- Missing or malformed project data: render checked-in fallback project markup and report a concise console warning.
- Missing updates snapshot: retain the existing user-facing fallback and link to the source repository.
- Missing image: reserve layout space safely and display the textual case content without a broken critical flow.
- Animation failure: remove enhancement-only state so all sections remain visible.
- Local preview without GitHub access: use checked-in snapshots and assets; no runtime network is required for core navigation.

## Testing and Acceptance

Automated checks will cover:

- JavaScript syntax;
- required pages, landmarks, titles, descriptions, and links;
- project data completeness and uniqueness;
- preservation of workflow triggers, permissions, sync-script environment contract, and static data files;
- mobile menu accessibility attributes;
- reduced-motion rules, responsive breakpoints, and overflow guards;
- absence of exposed GitHub tokens or reference-site personal contact details;
- local server responses and essential asset availability.

Browser verification will cover homepage, project index, updates, and representative article/about pages at 360, 768, and desktop widths. Completion requires no console errors attributable to the site, no page-level horizontal overflow, working menu/search/filter interactions, and readable layouts at each target.

## Branch and Delivery Rules

- All work is isolated on local branch `feat/portfolio-refresh`.
- `main` remains unchanged.
- No remote branch, commit, deployment, pull request, or GitHub setting is created or modified during this task.
- The final preview runs from the isolated worktree and is opened locally for review.
