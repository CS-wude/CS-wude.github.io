# WUDE / Personal Site

这是我的个人网站，也是我整理项目、技术判断和工程经验的地方。

我主要做 Java 后端、AI 应用工程和平台交付。相比把功能快速拼出来，我更关心系统在并发、超时、重试和依赖抖动时是否仍然可靠，以及问题发生后能不能留下足够清楚的证据。

[访问网站](https://cs-wude.github.io/) · [项目索引](./projects.html) · [技术手记](./notes.html) · [关于我](./about.html)

## 关于我

我的工作通常落在业务系统与基础设施之间：向上理解流程和状态，向下处理存储、队列、模型服务、工具协议与部署环境。做过微服务核心链路、异步任务、流式交互、知识检索、Agent 工具调用和容器化交付，也会参与前端联调，把一条链路真正接完整。

我也承担开发组组长的工作，包括需求拆解、方案评审、任务安排、代码评审和成员协作。我的带队方式偏技术型：先把上下文、边界和验收标准讲清楚，再让负责人拥有完整的问题空间。遇到故障时先补证据和复现，遇到重复劳动时再考虑自动化。

我习惯先画清状态流、失败路径和恢复入口，再写主流程。异步链路至少要能重试、能追踪，也要给人工接管留位置；做 AI 应用时，我把模型当成一种能力很强、但延迟与结果都不完全稳定的外部依赖来治理；带组时，我负责把问题拆到可以独立负责、独立验收，而不是把人拆成零散工时。

常用技术：`Java`、`Spring Boot`、`Spring Cloud`、`Redis`、`PostgreSQL`、`MongoDB`、`RAG`、`Agent`、`MCP`、`Docker`、`Kubernetes`、`Helm`。

## 项目方向

项目页按工程主题整理，重点记录我负责的链路、判断与取舍。

当前公开目录包含 7 个本人主导或独立开发的案例：

- **Lynkvis AI 室内设计出图平台**：统一模型 Provider、异步任务、素材管理和会员权益
- **电商选品与内容自动化 Agent**：跨平台研究、证据保留、机会评分和结构化报告
- **复能助手：企业级 RAG + MCP Agent**：文档检索、业务工具调用、流式回答和引用溯源
- **大白 AI 心理健康平台**：多模块状态协同、流式对话、测评与交易链路
- **工业合规知识平台**：文档处理、异步向量化、混合检索和本地推理
- **智能 SRE 运维助手**：Agent 执行循环、工具边界、实时反馈与故障降级
- **生成式内容调度平台**：批量任务、分级队列、模型网关与实时进度

## 网站内容

- [`index.html`](./index.html)：首页与重点内容入口
- [`projects.html`](./projects.html)：项目索引与工程问题拆解
- [`agent-tooling.html`](./agent-tooling.html)：Agent 工具链复盘
- [`notes.html`](./notes.html)：编程、带组和系统设计手记
- [`updates.html`](./updates.html)：短记录与阶段性思考
- [`about.html`](./about.html)：个人介绍与技术偏好

## 技术实现

网站使用原生 HTML、CSS 和 JavaScript ES Modules 构建，不依赖前端框架，也没有在线后端服务。项目资料集中在 `data/projects.js`，首页和项目索引从同一份静态数据渲染。

动态内容由 GitHub Actions 在构建阶段生成静态快照，再随网站一起部署到 GitHub Pages。浏览器只读取已经发布的数据，不直接请求 GitHub API。

主要结构：

```text
.
├── index.html                 # 首页
├── projects.html              # 项目索引
├── notes.html                 # 技术手记
├── updates.html               # 动态内容
├── assets/projects/           # 项目配图
├── data/
│   ├── projects.js            # 7 个项目的统一数据源
│   └── updates.*              # Action 生成的静态快照
├── tests/                     # 无依赖的静态站契约测试
├── package.json               # npm test 入口
└── .github/
    ├── workflows/             # Pages 部署工作流
    └── scripts/               # 内容同步脚本
```

## 本地预览

直接打开 `index.html` 即可浏览。需要通过本地 HTTP 服务查看时，可以在仓库根目录运行：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## 本地检查

仓库不需要安装第三方依赖。使用 Node.js 20 或更高版本运行：

```powershell
npm test
```

测试会检查项目数据、页面结构、移动端与减弱动效保护、静态资源、Actions 部署契约，以及公开产物中是否意外出现凭据或参考站联系人信息。

## 部署

推送到 `main` 后，`Deploy portfolio with GitHub updates` 工作流会先运行 `.github/scripts/sync-issues.mjs`，生成 `data/updates.json` 和 `data/updates-data.js`，再部署 GitHub Pages。定时任务会刷新更新页数据，浏览器只读取已经发布的静态快照，不直接访问 GitHub API。

## 内容说明

站点文字、项目说明与项目图片用于个人作品集展示，相关内容保留所有权利。引用或转载前请先取得许可。
