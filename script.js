import { featuredProjects } from "./data/projects.js";

export const escapeHTML = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const visualTemplates = {
  wellbeing: `
    <div class="wellbeing-stage" aria-hidden="true">
      <div class="visual-caption"><span>CARE SERVICE</span><span>AI / SAAS</span></div>
      <div class="wellbeing-dialogue"><span class="dialogue-label">AI CONVERSATION</span><i></i><i></i><i></i><b>STREAMING</b></div>
      <div class="wellbeing-modules"><span><b>01</b>Assessment</span><span><b>02</b>Booking</span><span><b>03</b>Membership</span></div>
    </div>`,
  knowledge: `
    <div class="knowledge-stage" aria-hidden="true">
      <div class="visual-caption"><span>PRIVATE KNOWLEDGE</span><span>RAG / MCP</span></div>
      <div class="knowledge-map"><span class="knowledge-node">DOCS</span><span class="knowledge-node">PARSE</span><span class="knowledge-node node-index">INDEX</span><span class="knowledge-node">TOOL</span><span class="knowledge-node node-answer">ANSWER</span></div>
      <div class="knowledge-footer"><span>RETRIEVAL</span><span>TOOL CALL</span><span>TRACEABLE</span></div>
    </div>`,
  sre: `
    <div class="sre-stage" aria-hidden="true">
      <div class="visual-caption"><span>AGENT RUNBOOK</span><span>SRE / MCP</span></div>
      <div class="sre-console"><span><b>01</b> OBSERVE <i>metrics / logs</i></span><span><b>02</b> REASON <i>agent planning</i></span><span><b>03</b> ACT <i>tool calling</i></span><span><b>04</b> REPORT <i>evidence</i></span></div>
      <div class="sre-signal"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>`,
  generation: `
    <div class="generation-stage" aria-hidden="true">
      <div class="visual-caption"><span>CONTENT PIPELINE</span><span>AIGC / QUEUE</span></div>
      <div class="generation-queue"><span><b>IMPORT</b><i></i></span><span><b>QUEUE</b><i></i></span><span><b>MODEL</b><i></i></span><span><b>EXPORT</b><i></i></span></div>
      <div class="generation-assets"><span>A</span><span>B</span><span>C</span><span>D</span></div>
    </div>`,
};

const projectMarkup = (project, index) => {
  const tags = project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  const highlights = project.highlights
    .map((highlight) => `<li>${escapeHTML(highlight)}</li>`)
    .join("");
  const number = String(index + 1).padStart(2, "0");
  const imageRatio = /^\d+\s*\/\s*\d+$/.test(project.imageRatio || "")
    ? project.imageRatio
    : "16 / 9";
  const visual = project.image
    ? `<button class="project-visual project-visual--media" type="button" data-project-image="${escapeHTML(project.image)}" data-project-alt="${escapeHTML(project.imageAlt)}" aria-label="预览${escapeHTML(project.title)}图片" style="--media-ratio:${escapeHTML(imageRatio)}">
        <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.imageAlt)}" loading="lazy" decoding="async" />
        <span class="project-media-open" aria-hidden="true">⛶</span>
      </button>`
    : `<div class="project-visual project-visual--${escapeHTML(project.color)}">${visualTemplates[project.visual] || visualTemplates.generation}</div>`;

  return `
    <article class="project" data-project-slug="${escapeHTML(project.slug)}" data-reveal>
      <div class="project-info">
        <p class="project-number">${number} / ${escapeHTML(project.period)}</p>
        <p class="project-role">${escapeHTML(project.role)}</p>
        <h3>${escapeHTML(project.title)}</h3>
        <p class="project-type">${escapeHTML(project.category)}</p>
        <p class="project-description">${escapeHTML(project.description)}</p>
        <ol class="project-highlights">${highlights}</ol>
        <div class="project-meta"><div class="project-tags">${tags}</div><a class="project-detail-link" href="./projects.html#${escapeHTML(project.slug)}">查看项目链路 →</a></div>
      </div>
      ${visual}
    </article>`;
};

export const renderFeaturedProjects = () =>
  featuredProjects().map(projectMarkup).join("");

const updateExcerpt = (issue) => {
  const source = issue?.body_text || issue?.body || "";
  const text = String(source)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "这条先留个标题，正文还没整理。";
  return text.length > 92 ? `${text.slice(0, 92).trim()}…` : text;
};

export const renderUpdatesPreview = (snapshot) => {
  if (snapshot?.schemaVersion !== 1 || !Array.isArray(snapshot.issues)) {
    return '<p class="updates-preview__empty">静态记录暂时不可用，可以前往动态页稍后再看。</p>';
  }

  const issues = snapshot.issues.slice(0, 3);
  if (!issues.length) {
    return '<p class="updates-preview__empty">工作台还没有公开记录。</p>';
  }

  return issues
    .map((issue) => {
      const date = Number.isNaN(Date.parse(issue.created_at))
        ? "日期待补"
        : new Intl.DateTimeFormat("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Shanghai",
          }).format(new Date(issue.created_at));
      return `<article class="updates-preview__item" data-reveal>
        <time datetime="${escapeHTML(issue.created_at)}">${escapeHTML(date)}</time>
        <a href="./updates.html?issue=${escapeHTML(issue.number)}">
          <h3>${escapeHTML(issue.title)}</h3>
          <p>${escapeHTML(updateExcerpt(issue))}</p>
        </a>
        <span aria-hidden="true">#${escapeHTML(issue.number)} ↗</span>
      </article>`;
    })
    .join("");
};

const initProjectLightbox = (projectList) => {
  const lightbox = document.createElement("dialog");
  lightbox.className = "project-lightbox";
  lightbox.setAttribute("aria-label", "项目图片预览");
  lightbox.innerHTML = `
    <button class="project-lightbox__close" type="button" aria-label="关闭图片预览" title="关闭"><span aria-hidden="true">×</span></button>
    <img alt="" />`;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const closeButton = lightbox.querySelector(".project-lightbox__close");
  let activePreview = null;

  const close = () => {
    if (typeof lightbox.close === "function" && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
      document.body.classList.remove("lightbox-open");
      activePreview?.focus();
    }
  };

  projectList.addEventListener("click", (event) => {
    const preview = event.target.closest("[data-project-image]");
    if (!preview) return;
    activePreview = preview;
    lightboxImage.src = preview.dataset.projectImage;
    lightboxImage.alt = preview.dataset.projectAlt;
    document.body.classList.add("lightbox-open");
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
    closeButton.focus();
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.closest(".project-lightbox__close")) close();
  });
  lightbox.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    activePreview?.focus();
  });
  lightbox.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
};

export const initHomepageProjects = () => {
  const projectList = document.querySelector("#projectList");
  if (!projectList) return;
  projectList.innerHTML = renderFeaturedProjects();
  initProjectLightbox(projectList);
  window.requestAnimationFrame(() => {
    projectList.querySelectorAll("[data-reveal]").forEach((element) => {
      element.classList.add("is-visible");
    });
  });
};

export const initUpdatesPreview = (
  snapshot = globalThis.window?.WUDE_UPDATES_SNAPSHOT,
) => {
  const container = globalThis.document?.querySelector("#updatesPreview");
  if (!container) return;
  container.innerHTML = renderUpdatesPreview(snapshot);
  globalThis.window?.requestAnimationFrame(() => {
    container.querySelectorAll("[data-reveal]").forEach((element) => {
      element.classList.add("is-visible");
    });
  });
};

if (typeof document !== "undefined") {
  initHomepageProjects();
  initUpdatesPreview();
}
