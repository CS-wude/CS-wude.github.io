// Homepage project entries.
const projects = [
  {
    title: "大白 AI 心理健康平台",
    type: "Industry SaaS / AI Application",
    year: "2026",
    description:
      "大白把 AI 咨询、心理画像、风险预警和快速筛查放进一套面向个人与组织的产品里。我负责的后端链路横跨服务治理、会话、测评和交易，重点是把多端状态收成可追踪的流程。",
    highlights: [
      "把服务发现、网关路由和接口约定收成同一套接入规则。",
      "接通流式 AI 会话，串起测评、报告和交易流程。",
      "补齐支付幂等、数据扩展和发布回滚这些不显眼但要命的环节。",
    ],
    tags: ["Spring Cloud", "SSE", "MongoDB", "Payment", "Vue 3", "CI/CD"],
    image: "./assets/projects/mental-health-platform.png",
    imageAlt: "大白 AI 心理健康平台宣传图，展示 AI 咨询、组织心理画像、风险预警与快速筛查",
    imageRatio: "903 / 502",
    color: "acid",
    visual: "wellbeing",
  },
  {
    title: "工业合规知识平台",
    type: "Private AI / RAG Platform",
    year: "2025—2026",
    description:
      "这个项目要把大量内部文档变成真正能查的知识，而不是做一个看起来会回答问题的页面。我主要盯文档进入系统后的那条长链路，以及模型服务在内网环境里的落地。",
    highlights: [
      "把解析、清洗、分块和索引做成一条能重跑的文档流水线。",
      "让向量化任务异步执行，并能在失败后找到原来的位置继续。",
      "组合多路检索与重排，同时处理离线模型的部署和降级。",
    ],
    tags: ["Java 17", "RAG", "Redis Stream", "Vector Search", "Local LLM", "Kubernetes"],
    image: "./assets/projects/industrial-compliance-dashboard.png",
    imageAlt: "工业合规平台数据大屏，展示区域风险趋势、风险分布与雷达图",
    imageRatio: "1859 / 912",
    color: "blue",
    visual: "knowledge",
  },
  {
    title: "智能 SRE 运维助手",
    type: "AI Agent / Observability",
    year: "2025",
    description:
      "我想解决的不是让模型多说几句，而是让它真的能查指标、翻日志、看集群，再把排查过程交代清楚。这个项目后来把我的注意力从 Prompt 转到了工具边界。",
    highlights: [
      "拆开推理、工具执行和总结，让每一步都能被看见和中断。",
      "给运维工具补上集群范围、时间和参数校验，避免无意义扫描。",
      "把模型接入、故障降级、流式反馈和长对话收进同一层。",
    ],
    tags: ["Spring Boot 3", "React", "AI Agent", "MCP", "Prometheus", "Kubernetes"],
    image: "./assets/projects/sre-copilot-console.png",
    imageAlt: "SRE Copilot 调查界面，展示 Kubernetes 时间线、日志和支持证据",
    imageRatio: "1859 / 903",
    color: "coral",
    visual: "sre",
  },
  {
    title: "生成式内容调度平台",
    type: "AIGC Infrastructure / Orchestration",
    year: "2025—2026",
    description:
      "批量生成真正难的不是调用一次模型，而是几百条任务同时排队时，谁先跑、失败后怎么办、换模型后状态怎么算。我做的是把这些琐碎但必要的事情收进一个工作台。",
    highlights: [
      "把表格导入、模板变量和任务校验整理成统一入口。",
      "用分级队列处理优先级、失败重试和任务状态流转。",
      "在模型网关后面接多种服务，再把实时进度推回工作台。",
    ],
    tags: ["NestJS", "TypeScript", "Redis Stream", "WebSocket", "Vue 3", "Docker"],
    color: "ink",
    visual: "generation",
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
  wellbeing: `
    <div class="wellbeing-stage" aria-hidden="true">
      <div class="visual-caption"><span>CARE SERVICE</span><span>01 / SAAS</span></div>
      <div class="wellbeing-dialogue">
        <span class="dialogue-label">AI CONVERSATION</span>
        <i></i><i></i><i></i>
        <b>STREAMING</b>
      </div>
      <div class="wellbeing-modules">
        <span><b>01</b>Assessment</span>
        <span><b>02</b>Booking</span>
        <span><b>03</b>Membership</span>
      </div>
    </div>`,
  knowledge: `
    <div class="knowledge-stage" aria-hidden="true">
      <div class="visual-caption"><span>PRIVATE KNOWLEDGE</span><span>02 / RAG</span></div>
      <div class="knowledge-map">
        <span class="knowledge-node node-source">DOCS</span>
        <span class="knowledge-node node-parse">PARSE</span>
        <span class="knowledge-node node-index">INDEX</span>
        <span class="knowledge-node node-recall">RECALL</span>
        <span class="knowledge-node node-answer">ANSWER</span>
        <i class="knowledge-line line-a"></i>
        <i class="knowledge-line line-b"></i>
        <i class="knowledge-line line-c"></i>
        <i class="knowledge-line line-d"></i>
      </div>
      <div class="knowledge-footer"><span>HYBRID RETRIEVAL</span><span>LOCAL MODEL</span><span>OFFLINE</span></div>
    </div>`,
  sre: `
    <div class="sre-stage" aria-hidden="true">
      <div class="visual-caption"><span>AGENT RUNBOOK</span><span>03 / SRE</span></div>
      <div class="sre-console">
        <span><b>01</b> OBSERVE <i>metrics / logs</i></span>
        <span><b>02</b> REASON <i>agent planning</i></span>
        <span><b>03</b> ACT <i>tool calling</i></span>
        <span><b>04</b> REPORT <i>streamed result</i></span>
      </div>
      <div class="sre-signal"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>`,
  generation: `
    <div class="generation-stage" aria-hidden="true">
      <div class="visual-caption"><span>CONTENT PIPELINE</span><span>04 / AIGC</span></div>
      <div class="generation-queue">
        <span><b>IMPORT</b><i></i></span>
        <span><b>TEMPLATE</b><i></i></span>
        <span><b>MODEL</b><i></i></span>
        <span><b>EXPORT</b><i></i></span>
      </div>
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
    : `<div class="project-visual project-visual--${escapeHTML(project.color)}">
        ${visualTemplates[project.visual] || visualTemplates.wellbeing}
      </div>`;

  return `
    <article class="project">
      <div class="project-info">
        <p class="project-number">${number} / ${escapeHTML(project.year)}</p>
        <h3>${escapeHTML(project.title)}</h3>
        <p class="project-type">${escapeHTML(project.type)}</p>
        <p class="project-description">${escapeHTML(project.description)}</p>
        <ol class="project-highlights">${highlights}</ol>
        <div class="project-meta">
          <div class="project-tags">${tags}</div>
        </div>
      </div>
      ${visual}
    </article>`;
};

projectList.innerHTML = projects.map(projectMarkup).join("");
currentYear.textContent = new Date().getFullYear();

const lightbox = document.createElement("dialog");
lightbox.className = "project-lightbox";
lightbox.setAttribute("aria-label", "项目图片预览");
lightbox.innerHTML = `
  <button class="project-lightbox__close" type="button" aria-label="关闭图片预览" title="关闭">
    <span aria-hidden="true">×</span>
  </button>
  <img alt="" />`;
document.body.append(lightbox);

const lightboxImage = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector(".project-lightbox__close");
let activePreview = null;

const closeLightbox = () => {
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

  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  } else {
    lightbox.setAttribute("open", "");
  }
  lightboxClose.focus();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target.closest(".project-lightbox__close")) {
    closeLightbox();
  }
});

lightbox.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
  activePreview?.focus();
});

lightbox.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    typeof lightbox.showModal !== "function" &&
    lightbox.hasAttribute("open")
  ) {
    closeLightbox();
  }
});

const projectCards = document.querySelectorAll(".project");

if (typeof IntersectionObserver === "function") {
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

  projectCards.forEach((project) => observer.observe(project));
} else {
  projectCards.forEach((project) => project.classList.add("is-visible"));
}
