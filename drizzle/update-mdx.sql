update posts set content_md = '
这个博客的写作格式是 MDX。简单说，它就是"会写组件的 Markdown"——在正文里可以直接 import 并渲染 UI 组件，而不是只能贴静态代码块。

## 为什么我选了 MDX

普通的 Markdown 足以覆盖 95% 的写作场景，但剩下那 5% 很折磨人：想放一个可交互的演示、一个带状态的按钮、一个动态生成的图表，就只能截一张图，然后眼睁睁看着它过时。

MDX 把这 5% 补上了：它支持嵌入 JavaScript 和 JSX 语法，可以把组件和逻辑直接混进 Markdown 内容里，文字和代码终于活在同一个文件里。

## 一个实际的例子

在 MDX 里嵌入组件大概长这样——写的时候是代码，渲染出来就是真正可以点击的元素：

```mdx
import LikeButton from "../components/LikeButton";

<LikeButton slug="hello-world" />
```

如果我只想"说明"这个按钮的行为，贴张图就够了；但既然可以让你亲手点一下，为什么不呢？

## 一点使用心得

- **组件是手段，不是目的。** 大部分文章依然是纯文字，只有真正需要交互时才动用组件，否则维护成本会吃掉写作的乐趣
- **静态优先。** 不加特殊声明的话，MDX 里的组件默认渲染成纯 HTML（没有 JavaScript），需要交互时再显式开启水合——对博客这种内容站非常友好
- **适合的才是好的。** 如果你的博客只有文字，普通 Markdown 完全够用，不必为了 MDX 而 MDX

## 延伸阅读

- [我的 Markdown 写作语法指南](/blog/markdown-style-guide/)——下一篇就说说这个博客里常用的排版语法
', content_html = '<p>这个博客的写作格式是 MDX。简单说，它就是&quot;会写组件的 Markdown&quot;——在正文里可以直接 import 并渲染 UI 组件，而不是只能贴静态代码块。</p>
<h2 id="为什么我选了-mdx" tabindex="-1">为什么我选了 MDX</h2>
<p>普通的 Markdown 足以覆盖 95% 的写作场景，但剩下那 5% 很折磨人：想放一个可交互的演示、一个带状态的按钮、一个动态生成的图表，就只能截一张图，然后眼睁睁看着它过时。</p>
<p>MDX 把这 5% 补上了：它支持嵌入 JavaScript 和 JSX 语法，可以把组件和逻辑直接混进 Markdown 内容里，文字和代码终于活在同一个文件里。</p>
<h2 id="一个实际的例子" tabindex="-1">一个实际的例子</h2>
<p>在 MDX 里嵌入组件大概长这样——写的时候是代码，渲染出来就是真正可以点击的元素：</p>
<pre class="astro-code shiki language-mdx" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#D73A49;--shiki-dark:#F97583">import</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> LikeButton </span><span style="color:#D73A49;--shiki-dark:#F97583">from</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> "../components/LikeButton"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;</span><span style="color:#005CC5;--shiki-dark:#79B8FF">LikeButton</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> slug</span><span style="color:#D73A49;--shiki-dark:#F97583">=</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"hello-world"</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> /></span></span>
<span class="line"></span></code></pre><p>如果我只想&quot;说明&quot;这个按钮的行为，贴张图就够了；但既然可以让你亲手点一下，为什么不呢？</p>
<h2 id="一点使用心得" tabindex="-1">一点使用心得</h2>
<ul>
<li><strong>组件是手段，不是目的。</strong> 大部分文章依然是纯文字，只有真正需要交互时才动用组件，否则维护成本会吃掉写作的乐趣</li>
<li><strong>静态优先。</strong> 不加特殊声明的话，MDX 里的组件默认渲染成纯 HTML（没有 JavaScript），需要交互时再显式开启水合——对博客这种内容站非常友好</li>
<li><strong>适合的才是好的。</strong> 如果你的博客只有文字，普通 Markdown 完全够用，不必为了 MDX 而 MDX</li>
</ul>
<h2 id="延伸阅读" tabindex="-1">延伸阅读</h2>
<ul>
<li><a href="/blog/markdown-style-guide/">我的 Markdown 写作语法指南</a>——下一篇就说说这个博客里常用的排版语法</li>
</ul>
', updated_at = 1787730868563 where slug = 'using-mdx';
