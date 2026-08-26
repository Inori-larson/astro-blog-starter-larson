# Larson's Blog

我的个人博客源码 —— 记录技术笔记、项目复盘与生活随想。

全栈部署在 Cloudflare 上（免费版即可运行）。

## 架构

```
边缘运行时（SSR，output: server）
 ├── D1 (SQLite)   文章/标签/评论/点赞/订阅/媒体元数据（Drizzle ORM）
 ├── KV CACHE      页面与查询的二级缓存（L1 为进程内存）
 ├── KV SESSION    后台登录会话
 └── R2            预留：媒体库文件存储（第 4 期）
```

- 内容页（首页/博客/文章/归档/标签/RSS/搜索索引）由数据库驱动，SSR + 缓存
- 纯静态页（关于/项目/友链/404/搜索壳）构建时预渲染
- 文章 HTML 在写入时预渲染（markdown-it + Shiki），运行时零渲染开销

## 功能特性

- 全站中文、浅色 / 深色双主题（跟随系统 + 手动切换，刷新不闪白）
- `Ctrl + K` 全局搜索弹窗（服务端 JSON 索引，客户端打分）
- 文章页：目录 TOC、阅读进度条、代码高亮 + 一键复制、相关推荐、上下篇
- 互动：点赞（访客指纹去重）、浏览量（按天聚合 + 双重去重）、评论（楼中楼回复 + 限流防刷）
- 后台管理 `/admin`：邮箱密码登录（JWT 会话 + PBKDF2 哈希）、仪表盘、在线 Markdown 编辑器、评论审核
- RSS 订阅 + Sitemap
- 数据库迁移（Drizzle Kit）+ 种子导入脚本

## 快速开始

```bash
npm install                 # 安装依赖
npm run db:apply            # 应用 D1 迁移（本地）
npm run db:seed             # 导入种子文章（本地）
npm run dev                 # 本地开发 localhost:4321
npm run build               # 构建产物到 ./dist/
npm run preview             # wrangler dev 预览构建结果
npm run deploy              # 部署（日常用 Git push 自动构建）
```

> 首次运行 wrangler 命令如卡住，设置环境变量 `WRANGLER_SEND_METRICS=false` 再试。

### 数据库命令

| 命令 | 作用 |
| --- | --- |
| `npm run db:generate` | 修改 `src/db/schema.ts` 后生成迁移 SQL |
| `npm run db:apply` / `db:apply:remote` | 应用迁移（本地/远程） |
| `npm run db:seed` / `db:seed:remote` | 重新导入种子文章 |
| `node scripts/create-admin.mjs 邮箱 密码` | 创建/重置管理员（生成 SQL，按提示应用） |

## 写作

- 在线写作：后台 `/admin/posts/new`（Markdown 编辑器 + 实时预览）
- 种子方式：`scripts/seed-content/*.md` 修改后运行 `npm run db:seed`

## 目录结构

```
src/
├── components/   # UI 组件
├── db/schema.ts  # 数据库表定义
├── data/         # 站点数据（项目列表、友链）
├── layouts/      # 页面布局
├── lib/          # db / cache / markdown 渲染 / posts 查询 / auth
├── pages/        # 路由页面（SSR + 预渲染）
└── styles/       # 全局样式（Tailwind CSS 4 + 设计令牌）
drizzle/          # 迁移 SQL（生成物）
scripts/          # seed-content 文章源 + 导入/迁移脚本
```

© Larson. All rights reserved.
