# WUDE

我的个人项目与技术手记，使用原生 HTML、CSS 和 JavaScript 构建，部署在 GitHub Pages。

## 页面

- `index.html`：首页与项目概览
- `projects.html`：项目索引
- `agent-tooling.html`：Agent 工具链复盘
- `notes.html`：技术手记
- `updates.html`：短记录与讨论
- `about.html`：关于我

## 内容维护

首页项目数据集中在 `script.js`。内容页共用 `docs.css` 和 `docs.js`，右侧目录会从正文中的 `h2`、`h3` 自动生成。

动态页的数据来自 `CS-wude/javaweb` Issues。部署工作流运行 `.github/scripts/sync-issues.mjs` 生成静态 JSON，再与网站一起发布。浏览器只读取已经部署的数据，不会直接消耗 GitHub API 配额。

不要在前端文件或仓库配置中写入 GitHub Token。需要额外读取权限时，只能通过仓库 Actions Secret 提供 `ISSUES_READ_TOKEN`。

## 本地查看

直接打开 `index.html` 即可浏览。使用本地 HTTP 服务时，从仓库根目录启动并访问首页。

## 部署

推送到 `main` 后，`Deploy portfolio with GitHub updates` 工作流会生成内容数据并部署 Pages。定时任务也会更新动态页的数据。
