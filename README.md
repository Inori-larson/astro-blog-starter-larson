# Larson's Blog

我的个人博客源码 —— 记录技术笔记、项目复盘与生活随想。

基于 [Astro](https://astro.build) 构建，部署在 [Cloudflare Workers](https://developers.cloudflare.com/workers/) 边缘网络上。

## 功能特性

- 全站中文、浅色 / 深色双主题（跟随系统 + 手动切换，刷新不闪白）
- 首页 / 博客 / 归档 / 标签 / 项目 / 友链 / 关于 / 搜索，共 10+ 页面
- `Ctrl + K` 全局搜索弹窗（构建时生成索引，客户端打分）
- 文章页：目录 TOC、阅读进度条、代码高亮 + 一键复制、相关推荐、分享栏
- 暗色模式下的 Shiki 双主题代码高亮
- RSS 订阅 + Sitemap
- View Transitions 页面软导航 + 滚动渐入动画

## 快速开始

```bash
npm install       # 安装依赖
npm run dev       # 本地开发 localhost:4321
npm run build     # 构建产物到 ./dist/
npm run preview   # 本地预览构建结果
npm run deploy    # 部署到 Cloudflare Workers
```

## 目录结构

```
src/
├── components/   # UI 组件（Header、Footer、PostCard、SearchModal…）
├── content/blog/ # 博客文章（Markdown / MDX）
├── data/         # 站点数据（项目列表、友链）
├── layouts/      # 页面布局
├── lib/          # 工具函数（搜索、阅读时长估算）
├── pages/        # 路由页面
└── styles/       # 全局样式（Tailwind CSS 4 + 设计令牌）
```

## 写作

在 `src/content/blog/` 下新建 `.md` 或 `.mdx` 文件即可：

```markdown
---
title: "文章标题"
description: "一句话摘要"
pubDate: "Jul 08 2022"
heroImage: "/blog-placeholder-3.jpg"
tags: ["随笔"]
---

正文内容…
```

## 致谢

- 站点初始模板来自 [Cloudflare Astro Blog Starter](https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template)
- 排版风格灵感源自 [Bear Blog](https://github.com/HermanMartinus/bearblog/)

© Larson. All rights reserved.
