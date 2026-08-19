import { PROJECTS } from "./data/projects.js";
import { escapeHTML } from "./script.js";

const projectImage = (project) => {
  if (!project.image) {
    return `<div class="project-index__visual project-index__visual--${escapeHTML(project.color)}" aria-hidden="true">
      <span>${escapeHTML(project.visual)}</span><strong>${escapeHTML(project.slug.replaceAll("-", " / "))}</strong>
    </div>`;
  }
  return `<figure class="project-index__visual">
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
    <div class="project-index__body">
      <div>
        <p class="project-index__summary">${escapeHTML(project.summary)}</p>
        <p>${escapeHTML(project.description)}</p>
        <ol class="project-index__highlights">${highlights}</ol>
        <div class="project-index__tags">${tags}</div>
      </div>
      ${projectImage(project)}
    </div>
  </article>`;
};

export const renderProjectCatalog = () => PROJECTS.map(projectMarkup).join("");

export const initProjectCatalog = (root = globalThis.document) => {
  const catalog = root?.querySelector("#projectCatalog");
  if (!catalog) return;
  catalog.innerHTML = renderProjectCatalog();
};

if (typeof document !== "undefined") initProjectCatalog();
