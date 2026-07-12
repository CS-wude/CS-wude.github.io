# WUDE Site

一个纯静态的个人项目展示站，可以直接部署到 GitHub Pages，不需要后端、数据库或服务器。

## 页面结构

- `index.html`：项目展示首页
- `projects.html`：项目文档总览
- `project-template.html`：可复制的项目详情页模板
- `updates.html`：从 GitHub Issues 同步的公开动态
- `about.html`：个人介绍页
- `notes.html`：随笔与记录页

首页使用顶部导航。内容页在顶部导航之外增加左侧分组目录和右侧文章目录。

## 修改项目

打开 `script.js`，编辑最上方的 `projects` 数组。每个项目支持：

- `title`：项目名称
- `type`：项目类型
- `year`：年份
- `description`：项目介绍
- `tags`：标签
- `link`：项目地址或 GitHub 地址，留空会显示“链接待补充”
- `color`：`acid`、`blue`、`coral`、`ink`
- `visual`：`interface`、`data`、`mobile`、`identity`

## 新增内容页

1. 复制 `project-template.html` 并重命名，例如 `my-project.html`。
2. 替换页面标题、简介和正文内容。
3. 在各内容页的 `.docs-sidebar` 中增加对应链接。
4. 首页项目需要跳转到该页面时，把 `script.js` 中项目的 `link` 改为 `./my-project.html`。

右侧文章目录由 `docs.js` 自动读取正文中的 `h2` 和 `h3` 生成。

## GitHub 动态

`updates.html` 会读取 GitHub Actions 生成的 `data/updates.json`，支持列表、分页、搜索、标签筛选和详情阅读。访客浏览页面时不会请求 GitHub API，因此不会消耗公开 API 配额。

数据源配置分为两处：

- `.github/workflows/deploy-pages.yml`：Actions 中的仓库与作者配置
- `updates.js` 顶部的 `updatesConfig`：页面校验和每页数量

当前数据源是 `CS-wude/javaweb` 中由 `CS-wude` 创建的 Issues。同步脚本会抓取 open 和 closed Issues，列表只显示 open，已关闭 Issue 的详情链接仍然有效。

页面配置包括：

- `owner`：GitHub 用户或组织
- `repo`：作为内容源的仓库
- `author`：允许出现在动态页中的 Issue 作者
- `perPage`：每页条数
- `snapshotUrl`：静态快照地址

Actions 每小时在第 17 和 47 分钟自动同步，也可以在 GitHub 的 `Actions` 页面手动运行 `Deploy portfolio with GitHub updates`。同步失败时不会发布损坏的快照，线上会继续保留上一版部署。

`data/updates-data.js` 是直接打开本地 HTML 时使用的配套快照；部署后的页面优先读取 `data/updates.json`。这两个文件都由 `.github/scripts/sync-issues.mjs` 同时生成。源码中的初始快照为空，Actions 会在 Pages artifact 中写入真实数据，但不会把生成结果提交回源码分支。

公开仓库不需要访问令牌。不要把 GitHub Token 或 PAT 写入任何前端 HTML、CSS、JavaScript 或配置文件；部署后的静态文件对所有访问者可见。

如果 GitHub 的跨仓库权限策略导致内置 `github.token` 无法读取 `javaweb`，可以创建一个只允许读取 `javaweb` Issues 的 fine-grained token，并在网站仓库的 `Settings` → `Secrets and variables` → `Actions` 中保存为 `ISSUES_READ_TOKEN`。该 Secret 只在 Actions 中使用，不会进入部署文件。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库。
2. 把本目录中的文件放到仓库根目录并推送到 `main` 分支。
3. 打开仓库的 `Settings` → `Pages`。
4. 在 `Build and deployment` 的 `Source` 中选择 `GitHub Actions`。
5. 打开仓库的 `Actions` 页面，选择 `Deploy portfolio with GitHub updates`。
6. 点击 `Run workflow` 完成首次快照同步和部署。
7. 后续推送到 `main` 或定时同步都会自动重新部署。

如果仓库名就是 `用户名.github.io`，网站地址会直接是 `https://用户名.github.io/`。

## 本地预览

直接打开 `index.html` 即可。也可以在本目录运行：

```powershell
python -m http.server 8787
```

然后访问 `http://127.0.0.1:8787/`。

## 自定义域名

后续购买域名后，可以在 GitHub Pages 设置中填写域名，并在本目录增加一个内容为域名的 `CNAME` 文件。
