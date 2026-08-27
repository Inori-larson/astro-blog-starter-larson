# Larson's Blog

我的个人博客 —— 记录技术笔记、项目复盘与生活随想。

全栈单仓库：Astro SSR + D1 + R2 媒体库 + Resend 邮件订阅。

## 架构

```
边缘运行时（SSR，output: server）
 ├── D1 (SQLite)     10 张表：文章/标签/评论/点赞/浏览统计/订阅/媒体/用户/设置（Drizzle ORM）
 ├── R2              媒体库文件存储（图片/视频，经 /media/* 路由提供，长缓存）
 ├── KV CACHE        页面与查询的二级缓存（L1 进程内存 + L2 KV 跨实例共享）
 ├── KV SESSION      后台登录会话
 └── Resend          邮件订阅验证 + 新文章群发通知
```

- 全部内容页由数据库驱动 SSR（含关于/项目/友链等，站点标题与文案后台可改，无需重新构建）
- 文章 HTML 在保存时预渲染（markdown-it + Shiki 双主题高亮），运行时零渲染开销
- 图片全部存 R2，代码仓库不存二进制资源

## 功能特性

### 前台

- 二次元双世界观主题：浅色「港区」（碧蓝航线，海军蓝）/ 暗色「圣杯」（Fate，金 + 血红），立绘背景、点击特效、自定义鼠标，跟随系统 + 手动切换不闪白
- `Ctrl + K` 全局搜索（服务端 JSON 索引 + 客户端打分）
- 文章页：目录 TOC、阅读进度条、代码高亮 + 一键复制、相关推荐、上下篇、头图原始比例展示
- 互动：点赞（访客指纹去重）、浏览量（按天聚合 + 双重去重）、评论（楼中楼 + 限流防刷 + 后台审核）
- 邮件订阅：输入邮箱 → 验证信 → 新文章自动群发
- RSS + Sitemap

### 后台 `/admin`

- 邮箱密码登录（PBKDF2 哈希 + JWT 会话 Cookie）
- 仪表盘：浏览/点赞/评论总量、近 14 天趋势图、热门文章
- 在线 Markdown 编辑器（实时预览、草稿、标签、头图）
- 媒体库：拖拽上传 R2、预览、删除、一键复制链接
- 评论审核（通过/拒绝/标记垃圾）
- 站点设置：站点标题、Logo、站长名称与头像（图片直接上传 R2）；首页 Hero 与关于页全部文案后台编辑，支持字体、颜色、加粗、换行，保存即时生效

## 快速开始

```bash
npm install                 # 安装依赖（Node >= 22）
cp .dev.vars.example .dev.vars   # 配置本地密钥
npm run db:apply            # 应用 D1 迁移（本地）
npm run db:seed             # 导入种子文章（本地）
node scripts/create-admin.mjs 邮箱 密码   # 创建管理员（生成 SQL，按提示应用）
npm run dev                 # 本地开发 localhost:4321
```

构建与部署：

```bash
npm run build               # 构建产物到 ./dist/
npm run preview             # wrangler dev 预览构建结果
npm run deploy              # 直接部署（日常用 Git push 自动构建）
```

> wrangler 命令如卡住，先设置 `WRANGLER_SEND_METRICS=false`。

### 环境变量

| 变量 | 说明 |
| --- | --- |
| `AUTH_SECRET` | 会话签名密钥，至少 32 字符随机串（必填） |
| `RESEND_API_KEY` | Resend 邮件 API Key（不配则邮件功能静默跳过） |

### 数据库命令

| 命令 | 作用 |
| --- | --- |
| `npm run db:generate` | 修改 `src/db/schema.ts` 后生成迁移 SQL |
| `npm run db:apply` / `db:apply:remote` | 应用迁移（本地 / 远程） |
| `npm run db:seed` / `db:seed:remote` | 重新导入种子文章 |
| `node scripts/create-admin.mjs 邮箱 密码` | 创建 / 重置管理员 |

## 写作

- 在线写作：后台 `/admin/posts/new`（编辑器 + 实时预览，图片从媒体库上传复制链接）
- 正文支持 R2 图片：`![说明](/media/uploads/...)`，自动懒加载与自适应
- 种子方式：`scripts/seed-content/*.md` 修改后运行 `npm run db:seed`

## 目录结构

```
src/
├── components/        # UI 组件（含 admin/ 后台控件）
├── db/schema.ts       # 数据库表定义（Drizzle）
├── data/              # 站点静态数据（项目列表、友链）
├── layouts/           # 页面布局（前台 / 文章 / 后台）
├── lib/
│   ├── auth.ts        # PBKDF2 + JWT 登录态
│   ├── cache.ts       # 两级缓存（内存 + KV）与主动失效
│   ├── posts.ts       # 文章/标签查询
│   ├── markdown.mjs   # Markdown 渲染（Shiki 双主题）
│   ├── settings.ts    # 站点设置读写（文案 + 样式）
│   ├── interactions.ts / visitor.ts / rate-limit.ts
│   └── mail.ts        # Resend 邮件
├── pages/
│   ├── api/           # REST 接口（auth/posts/media/subscribe/admin）
│   ├── admin/         # 后台页面
│   └── media/[...path].ts   # R2 文件服务路由
└── styles/            # 全局样式（Tailwind CSS 4 + 双主题令牌）
drizzle/               # 迁移 SQL（生成物）
scripts/               # 种子文章源 + 迁移/导入/管理员脚本
```

## 部署说明

1. Git push 到 `main` 触发自动构建部署
2. 首次部署需在控制台完成资源绑定（数据库 / KV / R2 与 `wrangler.json` 中配置对应）
3. Secrets 通过 `wrangler secret put` 配置：`AUTH_SECRET`、`RESEND_API_KEY`

## 许可

© Larson. All rights reserved.
