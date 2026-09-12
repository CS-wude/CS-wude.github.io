# 参考源码

2026-09-13 部署结构调整：`CS-wude/CS-wude.github.io` 仅发布博客；产品站独立为 `CS-wude/product`，学习站独立为 `CS-wude/fde-learning`。两个子站分别以 `sites/product`、`sites/fde-learning` submodule 供本地联调。三个仓库各自拥有 GitHub Pages 工作流，产品站访问路径仍为 `/product/`。

2026-09-12 拉取并迁移：

| 子站 | 上游 | 版本 |
| --- | --- | --- |
| `sites/product` | https://github.com/wmc837911722-del/wmc837911722-del.github.io | `592e1fada814169997a796e21ba925bf354804ae` |
| `sites/fde-learning` | https://github.com/wmc837911722-del/fde-learning | `0f3930755e4dfa71770a4f3722be0161026fa825` |

完整原始 Git 仓库保存在 `F:\wudeblog-references`。当前仓库保留子站运行所需源码，项目和课程内容按用户要求沿用参考，适配身份、联系人、路由、SEO 与统一 Pages 构建。

产品站采用上游已有 GitHub Pages 静态入口，不引入上游的数据库、Cloudflare Worker 或 Sites 托管配置。教程保留 Astro / Starlight、Pagefind 搜索及课程内容。

迁移验证：中英文全部 7 个项目数据除姓名与站内资源路径外与上游一致；13 个项目图片文件的 SHA-256 均与上游一致。完整构建成功，52 项测试通过，产品 TypeScript 检查和 Astro 检查通过，28 个教程内容页与 2 个 sitemap 文件通过校验。浏览器检查了中英文切换、案例详情、搜索及手机布局。

上游没有检测到 LICENSE 文件。本记录用于保留来源，不增加或改变原有授权。
