// Replace these demo entries with your own projects.
const projects = [
  {
    title: "Frame",
    type: "Product system",
    year: "2026",
    description: "一个用于展示产品体系的演示项目。替换成你的项目背景、解决的问题和最终成果。",
    tags: ["Product", "Web", "Design"],
    link: "./project-template.html",
    color: "acid",
    visual: "interface",
  },
  {
    title: "Pulse",
    type: "Data workspace",
    year: "2026",
    description: "一套数据工作台的演示页面。这里适合说明项目定位、你的职责以及最值得展示的亮点。",
    tags: ["Data", "Dashboard", "Frontend"],
    link: "",
    color: "blue",
    visual: "data",
  },
  {
    title: "Pocket",
    type: "Mobile utility",
    year: "2025",
    description: "一个移动端工具的展示占位。以后可以换成真实截图、产品链接或 GitHub 仓库地址。",
    tags: ["Mobile", "Prototype", "UI"],
    link: "",
    color: "coral",
    visual: "mobile",
  },
  {
    title: "Field Notes",
    type: "Open experiment",
    year: "2025",
    description: "用于容纳开源实验、创意编码或尚在生长中的小项目，不要求每件作品都成为完整产品。",
    tags: ["Open Source", "Creative", "Lab"],
    link: "",
    color: "ink",
    visual: "identity",
  },
];

const projectList = document.querySelector("#projectList");
const currentYear = document.querySelector("#currentYear");

const escapeHTML = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const visualTemplates = {
  interface: `
    <div class="browser-mockup" aria-hidden="true">
      <div class="browser-bar"><i></i><i></i><i></i></div>
      <div class="interface-body">
        <div class="interface-side">
          <strong>F.</strong><span></span><span></span><span></span><span></span>
        </div>
        <div class="interface-main">
          <div class="interface-title"></div>
          <div class="interface-grid"><span></span><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>`,
  data: `
    <div class="data-canvas" aria-hidden="true">
      <div class="data-panel">
        <h4>Pulse / 24</h4>
        <div class="data-stats"><span>Active <b>84%</b></span><span>Saved <b>1.2K</b></span><span>Growth <b>+31</b></span></div>
      </div>
      <div class="bars"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>`,
  mobile: `
    <div class="phone-stage" aria-hidden="true">
      <div class="phone"><div class="phone-screen"><strong>Today</strong><span></span><span></span><span></span></div></div>
      <div class="phone"><div class="phone-screen"><strong>Pocket</strong><span></span><span></span><span></span></div></div>
    </div>`,
  identity: `
    <div class="identity-stage" aria-hidden="true">
      <div class="identity-mark">W</div>
      <div class="identity-notes"><span>Open experiment / 04</span><strong>Ideas become visible through making.</strong></div>
    </div>`,
};

const projectMarkup = (project, index) => {
  const tags = project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  const number = String(index + 1).padStart(2, "0");
  const isExternal = /^https?:\/\//.test(project.link);
  const linkTarget = isExternal ? ' target="_blank" rel="noreferrer"' : "";
  const link = project.link
    ? `<a class="project-link" href="${escapeHTML(project.link)}"${linkTarget}>查看项目 ↗</a>`
    : `<span class="project-link is-placeholder">链接待补充</span>`;

  return `
    <article class="project">
      <div class="project-info">
        <p class="project-number">${number} / ${escapeHTML(project.year)}</p>
        <h3>${escapeHTML(project.title)}</h3>
        <p class="project-type">${escapeHTML(project.type)}</p>
        <p class="project-description">${escapeHTML(project.description)}</p>
        <div class="project-meta">
          <div class="project-tags">${tags}</div>
          ${link}
        </div>
      </div>
      <div class="project-visual project-visual--${escapeHTML(project.color)}">
        ${visualTemplates[project.visual] || visualTemplates.interface}
      </div>
    </article>`;
};

projectList.innerHTML = projects.map(projectMarkup).join("");
currentYear.textContent = new Date().getFullYear();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".project").forEach((project) => observer.observe(project));
