const updatesConfig = Object.freeze({
  owner: "CS-wude",
  repo: "javaweb",
  author: "CS-wude",
  perPage: 12,
  snapshotUrl: "./data/updates.json",
});

const repoUrl = `https://github.com/${updatesConfig.owner}/${updatesConfig.repo}`;
const issuesUrl = `${repoUrl}/issues`;

const content = document.querySelector("#updatesContent");
const searchInput = document.querySelector("#updatesSearchInput");
const labelInput = document.querySelector("#updatesLabelInput");
const filter = document.querySelector("#updatesFilter");
const filterText = document.querySelector("#updatesFilterText");
const feedHeading = document.querySelector("#feedHeading");
const feedKicker = document.querySelector("#feedKicker");
const resultSummary = document.querySelector("#resultSummary");
const syncStatus = document.querySelector("#syncStatus");
const currentYear = document.querySelector("#currentYear");

const params = new URLSearchParams(window.location.search);
const state = {
  query: (params.get("q") || "").trim().slice(0, 120),
  label: (params.get("label") || "").trim().slice(0, 100),
  page: Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1),
  issue: Math.max(0, Number.parseInt(params.get("issue") || "0", 10) || 0),
};

let loadedSnapshot = null;

const escapeHTML = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (value) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const excerptFromIssue = (issue) => {
  const source = issue.body_text || issue.body || "";
  const text = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "这条更新暂时没有正文摘要。";
  return text.length > 180 ? `${text.slice(0, 180).trim()}…` : text;
};

class SnapshotError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "SnapshotError";
    this.status = status;
  }
}

const normalizeSnapshot = (rawSnapshot) => {
  if (!rawSnapshot || typeof rawSnapshot !== "object") {
    throw new SnapshotError("Updates snapshot is not an object");
  }
  if (rawSnapshot.schemaVersion !== 1) {
    throw new SnapshotError("Unsupported updates snapshot version");
  }
  if (!Array.isArray(rawSnapshot.issues)) {
    throw new SnapshotError("Updates snapshot does not contain an issues array");
  }

  const source = rawSnapshot.source || {};
  const sourceMatches =
    source.owner === updatesConfig.owner &&
    source.repo === updatesConfig.repo &&
    String(source.author || "").toLowerCase() === updatesConfig.author.toLowerCase();

  if (!sourceMatches) {
    throw new SnapshotError("Updates snapshot source does not match the configured repository");
  }

  const generatedAt = rawSnapshot.generatedAt || null;
  if (generatedAt && Number.isNaN(Date.parse(generatedAt))) {
    throw new SnapshotError("Updates snapshot has an invalid generatedAt value");
  }

  const seenNumbers = new Set();
  const issues = rawSnapshot.issues.map((issue) => {
    const number = Number(issue?.number);
    const login = String(issue?.user?.login || "");

    if (!Number.isInteger(number) || number <= 0 || seenNumbers.has(number)) {
      throw new SnapshotError("Updates snapshot contains an invalid or duplicate issue number");
    }
    if (!["open", "closed"].includes(issue.state)) {
      throw new SnapshotError(`Issue #${number} has an invalid state`);
    }
    if (typeof issue.title !== "string" || !issue.title.trim()) {
      throw new SnapshotError(`Issue #${number} has an invalid title`);
    }
    if (Number.isNaN(Date.parse(issue.created_at))) {
      throw new SnapshotError(`Issue #${number} has an invalid created_at value`);
    }
    if (login.toLowerCase() !== updatesConfig.author.toLowerCase()) {
      throw new SnapshotError(`Issue #${number} has an unexpected author`);
    }

    seenNumbers.add(number);

    return {
      number,
      state: issue.state,
      title: issue.title.trim(),
      body: typeof issue.body === "string" ? issue.body : "",
      body_text: typeof issue.body_text === "string" ? issue.body_text : "",
      body_html: typeof issue.body_html === "string" ? issue.body_html : "",
      created_at: issue.created_at,
      updated_at: issue.updated_at || issue.created_at,
      closed_at: issue.closed_at || null,
      comments: Number.isInteger(issue.comments) ? issue.comments : 0,
      html_url: `${issuesUrl}/${number}`,
      user: { login: updatesConfig.author },
      labels: Array.isArray(issue.labels)
        ? issue.labels
            .filter((label) => label && typeof label === "object")
            .map((label) => ({
              name: String(label.name || "").trim(),
              color: /^[0-9a-f]{6}$/i.test(label.color || "")
                ? label.color.toLowerCase()
                : "c9cbc4",
            }))
            .filter((label) => label.name)
        : [],
    };
  });

  issues.sort((left, right) => {
    const dateDifference = Date.parse(right.created_at) - Date.parse(left.created_at);
    return dateDifference || right.number - left.number;
  });

  return {
    schemaVersion: 1,
    generatedAt,
    source: {
      owner: updatesConfig.owner,
      repo: updatesConfig.repo,
      author: updatesConfig.author,
      issuesUrl,
    },
    openIssueCount: issues.filter((issue) => issue.state === "open").length,
    issues,
  };
};

const getEmbeddedSnapshot = () => {
  try {
    return window.WUDE_UPDATES_SNAPSHOT
      ? normalizeSnapshot(window.WUDE_UPDATES_SNAPSHOT)
      : null;
  } catch (error) {
    throw new SnapshotError(error.message);
  }
};

const fetchSnapshot = async ({ force = false } = {}) => {
  if (!force && loadedSnapshot) return loadedSnapshot;

  const embeddedSnapshot = getEmbeddedSnapshot();
  if (window.location.protocol === "file:" && embeddedSnapshot) {
    loadedSnapshot = embeddedSnapshot;
    return loadedSnapshot;
  }

  try {
    const response = await fetch(updatesConfig.snapshotUrl, {
      cache: force ? "reload" : "no-cache",
    });

    if (!response.ok) {
      throw new SnapshotError(
        `Updates snapshot request failed (${response.status})`,
        response.status,
      );
    }

    loadedSnapshot = normalizeSnapshot(await response.json());
    return loadedSnapshot;
  } catch (error) {
    if (embeddedSnapshot) {
      loadedSnapshot = embeddedSnapshot;
      return loadedSnapshot;
    }
    if (error instanceof SnapshotError) throw error;
    throw new SnapshotError("Updates snapshot could not be loaded");
  }
};

const pageUrl = ({ page = state.page, issue = 0, label = state.label, query = state.query } = {}) => {
  const next = new URLSearchParams();
  if (query) next.set("q", query);
  if (label) next.set("label", label);
  if (page > 1) next.set("page", String(page));
  if (issue) next.set("issue", String(issue));
  const suffix = next.toString();
  return `./updates.html${suffix ? `?${suffix}` : ""}`;
};

const labelMarkup = (labels) =>
  (labels || [])
    .map((label) => {
      const name = escapeHTML(label.name);
      const href = pageUrl({ page: 1, issue: 0, label: label.name, query: "" });
      const color = /^[0-9a-f]{6}$/i.test(label.color || "") ? label.color : "c9cbc4";
      return `<a class="update-label" href="${escapeHTML(href)}" style="--label-color:#${color}">${name}</a>`;
    })
    .join("");

const renderLoading = (label) => {
  content.setAttribute("aria-busy", "true");
  resultSummary.textContent = label;
  content.innerHTML = `
    <div class="updates-skeleton" aria-hidden="true">
      <div><span></span><strong></strong><p></p></div>
      <div><span></span><strong></strong><p></p></div>
      <div><span></span><strong></strong><p></p></div>
      <div><span></span><strong></strong><p></p></div>
    </div>`;
};

const syncMessage = (snapshot) =>
  snapshot.generatedAt
    ? `快照更新于 ${formatDateTime(snapshot.generatedAt)}`
    : "等待首次 Actions 同步";

const renderFilters = () => {
  searchInput.value = state.query;
  labelInput.disabled = !state.label;
  labelInput.value = state.label;

  const active = [];
  if (state.query) active.push(`搜索“${state.query}”`);
  if (state.label) active.push(`标签“${state.label}”`);

  filter.hidden = active.length === 0;
  filterText.textContent = active.join(" · ");
};

const issueMatchesQuery = (issue, query) => {
  if (!query) return true;
  const terms = query.toLocaleLowerCase("zh-CN").split(/\s+/).filter(Boolean);
  const searchable = [
    issue.title,
    issue.body_text,
    issue.body,
    ...issue.labels.map((label) => label.name),
  ]
    .join(" ")
    .toLocaleLowerCase("zh-CN");
  return terms.every((term) => searchable.includes(term));
};

const renderList = (snapshot) => {
  const filteredIssues = snapshot.issues.filter(
    (issue) =>
      issue.state === "open" &&
      (!state.label || issue.labels.some((label) => label.name === state.label)) &&
      issueMatchesQuery(issue, state.query),
  );
  const total = filteredIssues.length;
  const totalPages = Math.max(1, Math.ceil(total / updatesConfig.perPage));
  const offset = (state.page - 1) * updatesConfig.perPage;
  const issues = filteredIssues.slice(offset, offset + updatesConfig.perPage);
  const hasPrevious = state.page > 1;
  const hasNext = state.page < totalPages;

  feedKicker.textContent = state.label ? `Label / ${state.label}` : "Issue-powered journal";
  feedHeading.textContent = state.query ? "搜索结果" : state.label ? `#${state.label}` : "最近更新";
  resultSummary.textContent = `${total} 条 · 第 ${state.page} 页`;
  syncStatus.textContent = syncMessage(snapshot);

  if (!issues.length) {
    const pending = !snapshot.generatedAt;
    const pageHint = pending
      ? "动态快照尚未生成。"
      : state.page > 1
        ? "这一页没有可显示的动态。"
        : "暂时没有匹配的公开动态。";
    const message = pending
      ? "首次部署完成同步后，公开 Issue 会自动出现在这里。"
      : "可以清除筛选，或直接前往 GitHub 查看仓库中的公开记录。";

    content.innerHTML = `
      <div class="updates-message">
        <p class="section-label">${pending ? "Snapshot pending" : "No updates found"}</p>
        <h3>${pageHint}</h3>
        <p>${message}</p>
        <div class="updates-message__actions">
          ${pending ? "" : '<a href="./updates.html">查看最近更新</a>'}
          <a href="${issuesUrl}" target="_blank" rel="noreferrer">打开 GitHub Issues ↗</a>
        </div>
      </div>`;
    content.setAttribute("aria-busy", "false");
    return;
  }

  const entries = issues
    .map((issue) => {
      const detailUrl = pageUrl({ issue: issue.number });
      return `
        <article class="update-entry">
          <div class="update-entry__index">
            <span>#${escapeHTML(issue.number)}</span>
            <time datetime="${escapeHTML(issue.created_at)}">${formatDate(issue.created_at)}</time>
          </div>
          <div class="update-entry__body">
            <h3><a href="${escapeHTML(detailUrl)}">${escapeHTML(issue.title)}</a></h3>
            <p>${escapeHTML(excerptFromIssue(issue))}</p>
            <div class="update-entry__meta">
              <div class="update-labels" aria-label="标签">${labelMarkup(issue.labels)}</div>
              <span>${issue.comments} 条讨论</span>
            </div>
          </div>
          <a class="update-entry__open" href="${escapeHTML(detailUrl)}" aria-label="阅读：${escapeHTML(issue.title)}">↗</a>
        </article>`;
    })
    .join("");

  const pagination = hasPrevious || hasNext
    ? `<nav class="updates-pagination" aria-label="动态分页">
        ${hasPrevious ? `<a href="${escapeHTML(pageUrl({ page: state.page - 1, issue: 0 }))}">← 较新</a>` : "<span></span>"}
        <span>Page ${state.page} / ${totalPages}</span>
        ${hasNext ? `<a href="${escapeHTML(pageUrl({ page: state.page + 1, issue: 0 }))}">更早 →</a>` : "<span></span>"}
      </nav>`
    : "";

  content.innerHTML = `<div class="updates-list">${entries}</div>${pagination}`;
  content.setAttribute("aria-busy", "false");
};

const isSafeUrl = (value, attribute) => {
  const normalized = String(value || "").trim();
  if (!normalized) return true;
  if (normalized.startsWith("#") || normalized.startsWith("/")) return true;

  try {
    const parsed = new URL(normalized, window.location.href);
    const allowed = attribute === "src" ? ["http:", "https:"] : ["http:", "https:", "mailto:"];
    return allowed.includes(parsed.protocol);
  } catch {
    return false;
  }
};

const sanitizeGitHubHtml = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html || "";

  const allowedElements = new Set([
    "A",
    "BLOCKQUOTE",
    "BR",
    "CODE",
    "DEL",
    "DETAILS",
    "DIV",
    "EM",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "HR",
    "IMG",
    "KBD",
    "LI",
    "OL",
    "P",
    "PRE",
    "S",
    "SAMP",
    "SMALL",
    "SPAN",
    "STRONG",
    "SUB",
    "SUMMARY",
    "SUP",
    "TABLE",
    "TBODY",
    "TD",
    "TFOOT",
    "TH",
    "THEAD",
    "TR",
    "UL",
  ]);
  const globalAttributes = new Set(["class", "id", "title"]);
  const elementAttributes = {
    A: new Set(["href"]),
    DETAILS: new Set(["open"]),
    IMG: new Set(["alt", "height", "src", "width"]),
    LI: new Set(["value"]),
    OL: new Set(["start"]),
    TD: new Set(["colspan", "rowspan"]),
    TH: new Set(["colspan", "rowspan", "scope"]),
  };

  template.content
    .querySelectorAll(
      "script, style, iframe, object, embed, form, input, button, textarea, select, link, meta, svg, math",
    )
    .forEach((node) => node.remove());

  template.content.querySelectorAll("*").forEach((element) => {
    if (!allowedElements.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const allowedForElement = elementAttributes[element.tagName] || new Set();
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const isAllowed =
        globalAttributes.has(name) ||
        allowedForElement.has(name) ||
        name.startsWith("aria-");

      if (!isAllowed) {
        element.removeAttribute(attribute.name);
        return;
      }
      if ((name === "href" || name === "src") && !isSafeUrl(attribute.value, name)) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === "A") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noreferrer noopener");
    }

    if (element.tagName === "IMG") {
      element.setAttribute("loading", "lazy");
      element.setAttribute("decoding", "async");
    }
  });

  return template.innerHTML;
};

const renderDetail = (issue, snapshot) => {
  const backUrl = pageUrl({ issue: 0 });
  const body = issue.body_html
    ? sanitizeGitHubHtml(issue.body_html)
    : `<p class="update-detail__plain">${escapeHTML(issue.body || "这条动态暂时没有正文。")}</p>`;

  feedKicker.textContent = `Issue / #${issue.number}`;
  feedHeading.textContent = "动态详情";
  resultSummary.textContent = formatDate(issue.created_at);
  syncStatus.textContent = syncMessage(snapshot);
  document.title = `${issue.title} — 动态 · WUDE`;

  content.innerHTML = `
    <article class="update-detail">
      <div class="update-detail__toolbar">
        <a href="${escapeHTML(backUrl)}">← 返回动态</a>
        <a href="${escapeHTML(issue.html_url)}" target="_blank" rel="noreferrer">在 GitHub 讨论 ↗</a>
      </div>
      <header class="update-detail__header">
        <p>#${escapeHTML(issue.number)} · ${escapeHTML(issue.user.login)}</p>
        <h1>${escapeHTML(issue.title)}</h1>
        <div class="update-detail__meta">
          <time datetime="${escapeHTML(issue.created_at)}">发布于 ${formatDateTime(issue.created_at)}</time>
          <span>${issue.state === "closed" ? "已关闭" : "公开中"}</span>
          <span>${issue.comments} 条讨论</span>
        </div>
        <div class="update-labels" aria-label="标签">${labelMarkup(issue.labels)}</div>
      </header>
      <div class="update-detail__body markdown-body">${body}</div>
      <footer class="update-detail__footer">
        <a href="${escapeHTML(backUrl)}">← 返回动态</a>
        <a href="${escapeHTML(issue.html_url)}" target="_blank" rel="noreferrer">继续阅读与讨论 ↗</a>
      </footer>
    </article>`;
  content.setAttribute("aria-busy", "false");
};

const errorMessage = (error) => {
  if (error instanceof SnapshotError && error.status === 404) {
    return "动态快照文件尚未部署。请先运行 GitHub Pages 工作流。";
  }
  if (error instanceof SnapshotError) {
    return "动态快照暂时不可用，上一版已部署内容不会受到影响。";
  }
  return "动态快照暂时无法读取，请稍后重试。";
};

const renderError = (error) => {
  syncStatus.textContent = "快照不可用";
  resultSummary.textContent = "暂不可用";
  content.innerHTML = `
    <div class="updates-message updates-message--error">
      <p class="section-label">Snapshot unavailable</p>
      <h3>动态没有加载完成</h3>
      <p>${escapeHTML(errorMessage(error))}</p>
      <div class="updates-message__actions">
        <button type="button" data-action="retry">重试</button>
        <a href="${issuesUrl}" target="_blank" rel="noreferrer">打开 GitHub Issues ↗</a>
      </div>
    </div>`;
  content.setAttribute("aria-busy", "false");
};

const load = async ({ force = false } = {}) => {
  renderFilters();
  renderLoading(state.issue ? "读取详情中" : state.query ? "搜索中" : "读取快照中");

  try {
    const snapshot = await fetchSnapshot({ force });

    if (state.issue) {
      feedKicker.textContent = `Issue / #${state.issue}`;
      feedHeading.textContent = "动态详情";
      const issue = snapshot.issues.find((entry) => entry.number === state.issue);
      if (!issue) throw new SnapshotError("Issue is not present in the snapshot", 404);
      renderDetail(issue, snapshot);
      return;
    }

    renderList(snapshot);
  } catch (error) {
    renderError(error);
  }
};

content.addEventListener("click", (event) => {
  const retry = event.target.closest('[data-action="retry"]');
  if (!retry) return;
  load({ force: true });
});

currentYear.textContent = new Date().getFullYear();
load();
