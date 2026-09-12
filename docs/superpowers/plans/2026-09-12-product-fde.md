# wude 双子站迁移计划

**目标：** 将参考产品站和 FDE 学习站源码纳入现有仓库，分别发布到 `/product/` 与 `/fde-learning/`。

**用户约束：** 保留参考布局、交互、项目和课程内容。站点身份为 wude / CS-wude；未知个人资料给出清单，邮箱、微信不沿用参考作者。现有根站继续使用。

**结构：** `sites/product` 使用参考站 React + Vite 静态构建与预渲染；`sites/fde-learning` 使用 Astro + Starlight；根目录 pnpm workspace 管理依赖。`scripts/assemble-site.mjs` 仅收集公开文件到 `_site`，GitHub Pages 工作流统一构建部署。

- [x] 添加迁移验收测试：两个首页、七个案例、二十周课程、内部链接与静态资源可解析，旧联系人不进入产物。
- [x] 迁入源码并修改产品站 base、路由、SEO、图片路径和身份；集中管理邮箱与微信配置。
- [x] 迁入教程，修改站点、仓库编辑链接与主站链接，保留课程正文和项目。
- [x] 接入 pnpm 构建和 Pages 发布，原站增加两个入口。
- [x] 构建并执行原站回归、教程校验、产物链接检查与浏览器检查。
- [x] 记录上游仓库及版本，提供本地预览和个人信息补充清单。

验收命令：`pnpm install`、`pnpm build`、`pnpm test`、`pnpm --dir sites/fde-learning check`、`pnpm --dir sites/fde-learning verify`、`node --test tests/subsites-build.test.mjs`。
