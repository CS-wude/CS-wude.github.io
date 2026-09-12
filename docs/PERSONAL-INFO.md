# wude：个人信息配置

已设置显示名 **wude**、GitHub **CS-wude**、产品站 `/product/`、教程站 `/fde-learning/`。参考站的 7 个项目及第 1–20 周课程内容继续保留。

## 已补充的联系方式

| 信息 | 修改位置 | 当前处理 |
| --- | --- | --- |
| 接收合作邮件的邮箱 | `sites/product/app/profile.ts` 的 `emails` | `wudemail@foxmail.com` |
| 微信号 | 同文件的 `wechatId` | `cxyybc1999` |
| 微信二维码 | `sites/product/public/contact/wechat-wude.jpg`，配置项 `wechatQr` | 用户提供的原图，未修改二维码 |

当前配置：

```ts
emails: [{ label: "EMAIL", address: "wudemail@foxmail.com" }],
wechatQr: "/product/contact/wechat-wude.jpg",
wechatId: "cxyybc1999",
```

## 建议核实并完善

- **职业称谓与个人简介**：`sites/product/app/site-copy.ts` 中英文的 `seo`、`hero.intro`、`capabilitiesSection`、`about`；已根据原个人站的 Java 后端、AI 应用、平台交付和开发组组长介绍强化表达。没有新增未经提供的任职公司、学历、年限或量化业绩。
- **当前是否接合作、服务范围与合作方式**：同文件的 `header.availability`、`services`、`process`、`contact`，目前保留参考文案。
- **个人经历与合作品牌**：同文件的 `partners`。项目内容按你的要求保留；涉及你个人经历的描述，可后续单独核实。
- **项目角色归属**：同文件 `caseStudy.projects` 的 `role`、`roleNote`。本次保留参考项目和角色描述，仅替换姓名；如用于对外求职或合作介绍，按你的实际参与情况填写。
- **教程站作者介绍**：`sites/fde-learning/astro.config.mjs` 的 Person 描述；当前显示 wude 和 FDE / 企业 AI 交付方向。
- **头像、简历、城市、电话**：当前模板没有必填入口，可按需后续增加。本次未虚构这些资料。

原作者邮箱、微信二维码、微信所在地、搜索引擎站点验证已清理。分享卡片改用 wude 名称和你的域名。

## 本地运行

Node.js 24，pnpm 11.19.0：

```powershell
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm preview
```

浏览器打开 `http://127.0.0.1:8012/product/` 和 `http://127.0.0.1:8012/fde-learning/`。

产品站开发：`pnpm dev:product`；教程站开发：`pnpm dev:fde`。

## 发布

三个仓库分别发布，GitHub Pages 的 Source 均为 GitHub Actions：

- `CS-wude/CS-wude.github.io`：仅发布个人博客，无须构建或安装两个子站。
- `CS-wude/product`：独立发布 `/product/`，使用产品站自己的工作流、依赖锁文件和发布校验。
- `CS-wude/fde-learning`：发布 `/fde-learning/`，使用学习站自己的工作流与依赖锁文件。

`sites/product`、`sites/fde-learning` 是独立仓库的 Git submodule，便于本地同时预览三个站。首次克隆主仓库时使用 `git clone --recurse-submodules`；已有克隆执行 `git submodule update --init --recursive`。修改子站后，应先在对应目录提交并推送，再在主仓库提交新的 submodule 版本引用。仅维护博客时不需要初始化子站。

教程导航沿用上游“24 周标准教程”规划，但上游实际只有第 1–20 周文章。本次未补写第 21–24 周。
