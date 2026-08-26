---
title: "用 MDX 写博客是什么体验"
description: "在 Markdown 里直接嵌入组件——我选择 MDX 作为博客写作格式的原因。"
pubDate: "Jun 01 2024"
heroImage: "/blog-placeholder-5.jpg"
tags: ["MDX", "写作", "技术"]
---

这个博客的写作格式是 MDX。简单说，它就是"会写组件的 Markdown"——在正文里可以直接 import 并渲染 UI 组件，而不是只能贴静态代码块。

## 为什么我选了 MDX

普通的 Markdown 足以覆盖 95% 的写作场景，但剩下那 5% 很折磨人：想放一个可交互的演示、一个带状态的按钮、一个动态生成的图表，就只能截一张图，然后眼睁睁看着它过时。

MDX 把这 5% 补上了：它支持嵌入 JavaScript 和 JSX 语法，可以[把组件和逻辑直接混进 Markdown 内容](https://mdxjs.com/docs/what-is-mdx/)里，文字和代码终于活在同一个文件里。

## 一个实际的例子

在 MDX 里嵌入组件大概长这样——写的时候是代码，渲染出来就是真正可以点击的元素：

```mdx
import HeaderLink from "../../components/HeaderLink.astro";

<HeaderLink href="#" onclick="alert('clicked!')">
	文章里嵌入的组件
</HeaderLink>
```

如果我只想"说明"这个按钮的行为，贴张图就够了；但既然可以让你亲手点一下，为什么不呢？

## 一点使用心得

- **组件是手段，不是目的。** 大部分文章依然是纯文字，只有真正需要交互时才动用组件，否则维护成本会吃掉写作的乐趣
- **静态优先。** 不加特殊声明的话，MDX 里的组件默认渲染成纯 HTML（没有 JavaScript），需要交互时再显式开启水合——对博客这种内容站非常友好
- **适合的才是好的。** 如果你的博客只有文字，普通 Markdown 完全够用，不必为了 MDX 而 MDX

## 延伸阅读

- [MDX 语法文档](https://mdxjs.com/docs/what-is-mdx)
- [我的 Markdown 写作语法指南](/blog/markdown-style-guide/)——下一篇就说说这个博客里常用的排版语法
