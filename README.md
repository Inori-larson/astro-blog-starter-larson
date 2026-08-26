# Larson's Blog

我的个人博客源码 —— 记录技术笔记、项目复盘与生活随想。

基于 [Astro](https://astro.build) 构建，全栈部署在 [Cloudflare Workers](https://developers.cloudflare.com/workers/)（免费版即可运行）。

## 架构

```
Cloudflare Workers（Astro SSR，output: server）
 ├── D1 (SQLite)   文章/标签/评论/点赞/订阅/媒体元数据（Drizzle ORM）
 ├── KV CACHE      页面与查询的二级缓存（L1 为进程内存）
 ├── KV SESSION    预留：后台登录会话（第 3 期）
 └── R2            预留：媒体库文件存储（第 3 期）
```

- 内容页（首页/博客/文章/归档/标签/RSS/搜索索引）由 D1 数据驱动，SSR + 缓存
- 纯静态页（关于/项目/友链/404/搜索壳）构建时预渲染
- 文章 HTML 在写入时用 markdown-it + Shiki 预渲染（与构建时 Astro 输出同构），运行时零渲染开销

## 功能特性

- 全站中文、浅色 / 深色双主题（跟随系统 + 手动切换，刷新不闪白）
- `Ctrl + K` 全局搜索弹窗（服务端 JSON 索引，客户端打分）
- 文章页：目录 TOC（桌面粘性 + 移动端折叠）、阅读进度条、代码高亮 + 一键复制、相关推荐、上下篇、分享栏
- 卡片 → 文章页头图共享元素过渡动画
- **互动**：点赞（访客指纹去重）、浏览量（按天聚合 + 双重去重）、评论（楼中楼回复 + 限流防刷）
- **后台管理 `/admin`**：邮箱密码登录（JWT 会话 + PBKDF2 哈希）、仪表盘（统计/趋势/热门文章）、在线 Markdown 编辑器（实时预览/草稿/标签）、评论审核
- RSS 订阅 + Sitemap
- 数据库迁移（Drizzle Kit）+ 种子导入脚本

## 快速开始

```bash
npm install                 # 安装依赖
npm run db:apply            # 应用 D1 迁移（本地）
npm run db:seed             # 导入种子文章（本地）
npm run dev                 # 本地开发 localhost:4321（自动代理本地 D1）
npm run build               # 构建产物到 ./dist/
npm run preview             # wrangler dev 预览构建结果
npm run deploy              # 部署到 Cloudflare Workers
```

> 首次运行 wrangler 命令如卡住，设置环境变量 `WRANGLER_SEND_METRICS=false` 再试（禁用遥测提示）。

### 数据库命令

| 命令 | 作用 |
| --- | --- |
| `npm run db:generate` | 修改 `src/db/schema.ts` 后生成迁移 SQL |
| `npm run db:apply` | 应用迁移到本地 D1 |
| `npm run db:apply:remote` | 应用迁移到远程 D1 |
| `npm run db:seed` | 重新导入 `scripts/seed-content/` 下的文章（本地） |
| `npm run db:seed:remote` | 同上（远程） |
| `node scripts/create-admin.mjs` | 创建/重置管理员（生成 SQL，按提示应用） |

## 后台管理

访问 `/admin` 进入后台（默认重定向到登录页）：

1. **初始化管理员**：`node scripts/create-admin.mjs your@email.com yourpassword`，然后按提示执行两条 wrangler 命令（本地 + 远程）
2. **设置会话密钥**：本地复制 `.dev.vars.example` 为 `.dev.vars`；远程执行 `npx wrangler secret put AUTH_SECRET`（≥32 字符随机串）
3. 功能：仪表盘（浏览趋势/热门文章）、写文章（Markdown 编辑器 + 实时预览 + 草稿）、评论审核

## 写作

文章存在 D1 数据库中。种子内容在 `scripts/seed-content/*.md`（frontmatter 含 title/description/pubDate/heroImage/tags），修改后运行 `npm run db:seed` 重新导入。在线写作后台将在第 3 期上线。

## 目录结构

```
src/
├── components/   # UI 组件（Header、Footer、PostCard、SearchModal…）
├── db/schema.ts  # 数据库表定义（Drizzle）
├── data/         # 站点数据（项目列表、友链）
├── layouts/      # 页面布局
├── lib/          # db / cache / markdown 渲染 / posts 查询
├── pages/        # 路由页面（SSR + 预渲染）
└── styles/       # 全局样式（Tailwind CSS 4 + 设计令牌）
drizzle/          # 迁移 SQL + seed.sql（生成物）
scripts/          # seed-content 文章源 + 导入/迁移脚本
```

## 路线图

- [x] 第 0 期：UI 基建（Tailwind 4 / 暗色模式 / 动效）
- [x] 第 0.5 期：页面扩展（归档/标签/项目/友链/搜索）
- [x] 第 1 期：D1 数据库 + Drizzle 数据层
- [x] 第 2 期：互动功能（评论 / 点赞 / 浏览量 / Turnstile）
- [x] 第 3 期：后台管理（登录 / 在线写作 / 评论审核）
- [ ] 第 4 期：订阅与通知（Resend 邮件）+ R2 媒体库
- [ ] 第 4 期：订阅与通知（Resend 邮件）

## 致谢

- 站点初始模板来自 [Cloudflare Astro Blog Starter](https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template)
- 排版风格灵感源自 [Bear Blog](https://github.com/HermanMartinus/bearblog/)

© Larson. All rights reserved.
