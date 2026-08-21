import { PROJECTS } from "./data/projects.js";
import { escapeHTML } from "./script.js";

const projectImage = (project) => {
  const imageRatio = /^\d+\s*\/\s*\d+$/.test(project.imageRatio || "")
    ? project.imageRatio
    : "16 / 9";
  if (!project.image) {
    return `<div class="project-index__visual project-index__visual--${escapeHTML(project.color)}" aria-hidden="true" style="--project-media-ratio:${escapeHTML(imageRatio)}">
      <span>${escapeHTML(project.visual)}</span><strong>${escapeHTML(project.slug.replaceAll("-", " / "))}</strong>
    </div>`;
  }
  return `<figure class="project-index__visual" style="--project-media-ratio:${escapeHTML(imageRatio)}">
    <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.imageAlt)}" loading="lazy" decoding="async" />
  </figure>`;
};

const projectMarkup = (project, index) => {
  const number = String(index + 1).padStart(2, "0");
  const highlights = project.highlights
    .map((highlight) => `<li>${escapeHTML(highlight)}</li>`)
    .join("");
  const tags = project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");

  return `<article class="project-index__item" id="${escapeHTML(project.slug)}" data-project-slug="${escapeHTML(project.slug)}">
    <div class="project-index__heading">
      <span>${number} / ${escapeHTML(project.period)}</span>
      <div><p>${escapeHTML(project.category)}</p><h3>${escapeHTML(project.title)}</h3></div>
      <strong class="project-index__role">${escapeHTML(project.role)}</strong>
    </div>
    <div class="project-index__overview">
      <p class="project-index__summary">${escapeHTML(project.summary)}</p>
    </div>
    <details class="project-index__details">
      <summary><span>查看职责与关键链路</span><span aria-hidden="true">＋</span></summary>
      <div class="project-index__details-body">
        <p>${escapeHTML(project.description)}</p>
        ${projectImage(project)}
        <ol class="project-index__highlights">${highlights}</ol>
        <div class="project-index__tags">${tags}</div>
      </div>
    </details>
  </article>`;
};

export const renderProjectCatalog = () => PROJECTS.map(projectMarkup).join("");

export const initProjectCatalog = (
  root = globalThis.document,
  view = globalThis.window,
) => {
  const catalog = root?.querySelector("#projectCatalog");
  if (!catalog) return;
  catalog.innerHTML = renderProjectCatalog();

  const hash = view?.location?.hash?.slice(1);
  if (!hash) return;

  let targetId = hash;
  try {
    targetId = decodeURIComponent(hash);
  } catch {
    return;
  }

  view.requestAnimationFrame?.(() => {
    const target = root.getElementById?.(targetId);
    if (!target) return;
    const details = target.querySelector(".project-index__details");
    if (details) details.open = true;
    target.scrollIntoView({ block: "start" });
  });
};

if (typeof document !== "undefined" && typeof window !== "undefined") {
  initProjectCatalog(document, window);
}
