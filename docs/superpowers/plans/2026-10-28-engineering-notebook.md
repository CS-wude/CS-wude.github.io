# Engineering notebook implementation plan

**Goal:** 将博客调整为克制的工程笔记风格，解决手机全屏导航和经历表述问题。

**Architecture:** 沿用 HTML、CSS、ES Modules 和静态快照；在现有主题中修改规则，避免新增覆盖层。全局下拉与内容页目录保持独立。

**Tech Stack:** 原生 HTML/CSS/JavaScript，Node.js 24，node:test。

**Spec:** `docs/superpowers/specs/2026-10-28-engineering-notebook-design.md`

## Global constraints

- 不引入依赖，不变更文章 URL、项目事实和部署流程。
- 组长为过去经历；手机导航最小点击高度 44px。
- 本地预览交付，不自动发布线上。

## Review focus

- 手机低高度与横屏时导航可滚动，正文不被锁定。
- Escape 恢复焦点，点击外部与 Tab 离开菜单时关闭。
- 跨越 880/881px 后恢复桌面导航。
- 内容页目录开关、图片预览和项目展开正常。
- 320px 到桌面均无意外横向溢出，减弱动效有效。

## Task 1: Compact navigation

Files: `styles.css`, `vault.css`, `site.js`, `tests/portfolio-contract.test.mjs`.

- [x] 更新滚动、外部点击、焦点离开与 Escape 行为测试，观察失败。
- [x] 将旧全屏导航改为顶栏下方下拉；移除全局导航滚动锁，保留目录滚动锁。
- [x] 运行行为测试，并在浏览器检查开关、尺寸与键盘。

## Task 2: Copy and visual hierarchy

Files: `index.html`, `about.html`, `README.md`, `vault.css` 与公开页面资源版本。

- [x] 改写简介与栏目标题；修正组长经历的时态，文章入口提前。
- [x] 简化主题边框、阴影、配色和字体，缩小首屏和关于页装饰。
- [x] 更新已不符合新设计的样式契约，保留结构、内容与可访问性检查。

## Task 3: Verification and preview

- [x] `npm test`、`npm run build`、`git diff --check` 均成功。
- [x] 浏览器检查手机、横屏、平板与桌面；验证内容页、菜单交互和资源加载。
- [x] 自审差异，展示本地预览与验证结果。


## 验证记录

- `npm test`：51/51 通过，包含导航触发、外部点击、焦点移出、Escape、断点重置与独立目录行为。
- `npm run build` 与 `git diff --check`：通过。
- 浏览器首页检查：320×640、390×844、844×390、768×1024、880×700、881×700、1440×1000。无页面横向溢出；手机菜单高 262px，导航项目至少 44px。
- 浏览器内容检查：关于、项目、手记、动态文章、Agent 复盘的手机与桌面布局无页面横向溢出或失效图片。
- 实际键盘检查：Tab 进入菜单并在移出时收起，Escape 回到开关；手机切到桌面后清除展开状态。
- 目录、项目深链展开和收起、图片弹窗与 Escape 关闭正常；检查页面未发现控制台错误。
- 本地源数据是仓库内的空静态快照。预览使用当前已发布网站的 45 条记录，下载到生成目录 `_site/data`，未更改源快照或部署流程。
- 本地地址：http://127.0.0.1:8028/ 。改动位于 `style/engineering-notebook` 分支，未推送或发布。


## 会员素材优化补充

- 根据用户明确要求，通过正常界面解锁并使用 MotionSites VIP 的 Creative Designer Portfolio（Prompt）。
- 首页调整为居中布局，标题结合衬线字与系统无衬线字，加入本地 CSS 淡紫/暖橙背景，并平衡手机段落换行；卡片与控件使用适度圆角。
- CSS 资源版本更新为 `20261028-2`。没有加入远程字体、视频或第三方运行时。
- 再次运行全部 51 项测试、构建与差异空白检查，均通过。
- 浏览器复核 320、390、768、844、881、1440px 宽度：标题与页面无横向溢出，手机菜单仍为 262px，预览正常显示 3 条文章。


## 2026-10-29 发布

用户明确要求将当前优化提交到 GitHub，并更新 github.io。发布前重新运行全部 51 项测试、静态构建和差异检查，均通过；已核对 origin/main 与任务基线一致。采用现有 main 推送触发的 GitHub Pages 工作流发布，并在工作流完成后核验线上 HTML、CSS 与导航行为。
