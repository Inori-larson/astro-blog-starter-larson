-- 种子数据：由 scripts/import-seed.mjs 生成，勿手改
DELETE FROM post_tags;
DELETE FROM posts;
DELETE FROM tags;
INSERT INTO posts (slug, title, description, content_md, content_html, hero_image, status, published_at, updated_at, reading_minutes, author_id, created_at, deleted_at) VALUES
('first-post', '为什么我又开始写博客', '在短视频与信息流的年代，重新拾起长文写作的理由。', '
距离我上一次认真写长文，已经过去很久了。社交网络把表达切成了碎片：一条动态、一张截图、几句吐槽。看起来每天都在输出，回头看却什么都没留下。

所以我又开始写博客了。

## 给自己的想法一个家

发在平台上的内容，说到底还是寄人篱下。算法决定谁能看到它，平台决定它活多久。而一个自己的站点不一样——域名是我的，数据是我的，排版是我的，连那些写得笨拙的旧文章，也都原封不动地留在那里，像一间不会被人翻动的旧书房。

我想要的就是这样一个地方：**想法的存放处，而不是表演的舞台。**

## 写作是最好的学习方式

这几年我有一个越来越深的体会：把一件事做出来，和把一件事讲清楚，完全是两回事。

很多次我以为自己已经掌握了某个技术，直到试图写成文章、需要向一个想象中的读者解释"为什么"的时候，才发现自己只是记住了结论，而没理解推导。写作逼着你把知识重新整理一遍，把含糊的地方掰开揉碎。**所以这篇文章的读者首先是我自己。**

## 降低期待，保持节奏

我不打算给自己定"周更"之类的目标——经验告诉我，deadline 式的写作坚持不了三个月。只写想写的，写到哪算哪。也许一年只有十篇，但每一篇都是我真的想说的东西。

如果你也不小心刷到了这篇文章，欢迎常来坐坐。这个数字花园才刚刚翻土，后面会慢慢种上更多的东西。
', '<p>距离我上一次认真写长文，已经过去很久了。社交网络把表达切成了碎片：一条动态、一张截图、几句吐槽。看起来每天都在输出，回头看却什么都没留下。</p>
<p>所以我又开始写博客了。</p>
<h2 id="给自己的想法一个家" tabindex="-1">给自己的想法一个家</h2>
<p>发在平台上的内容，说到底还是寄人篱下。算法决定谁能看到它，平台决定它活多久。而一个自己的站点不一样——域名是我的，数据是我的，排版是我的，连那些写得笨拙的旧文章，也都原封不动地留在那里，像一间不会被人翻动的旧书房。</p>
<p>我想要的就是这样一个地方：<strong>想法的存放处，而不是表演的舞台。</strong></p>
<h2 id="写作是最好的学习方式" tabindex="-1">写作是最好的学习方式</h2>
<p>这几年我有一个越来越深的体会：把一件事做出来，和把一件事讲清楚，完全是两回事。</p>
<p>很多次我以为自己已经掌握了某个技术，直到试图写成文章、需要向一个想象中的读者解释&quot;为什么&quot;的时候，才发现自己只是记住了结论，而没理解推导。写作逼着你把知识重新整理一遍，把含糊的地方掰开揉碎。<strong>所以这篇文章的读者首先是我自己。</strong></p>
<h2 id="降低期待保持节奏" tabindex="-1">降低期待，保持节奏</h2>
<p>我不打算给自己定&quot;周更&quot;之类的目标——经验告诉我，deadline 式的写作坚持不了三个月。只写想写的，写到哪算哪。也许一年只有十篇，但每一篇都是我真的想说的东西。</p>
<p>如果你也不小心刷到了这篇文章，欢迎常来坐坐。这个数字花园才刚刚翻土，后面会慢慢种上更多的东西。</p>
', '/blog-placeholder-3.jpg', 'published', 1657209600000, NULL, 1, NULL, 1657209600000, NULL),
('markdown-style-guide', 'Markdown 语法指南', '我在博客写作中常用的 Markdown 语法备忘，也是这个站点排版能力的完整演示。', '
这篇文章既是我的 Markdown 语法备忘，也是这个博客排版能力的完整演示——所有能用的语法都能在这篇文章里看到实际效果。

## 标题

下面的 HTML `<h1>`—`<h6>` 元素表示六个级别的章节标题。`<h1>` 是最高级别的标题，而 `<h6>` 是最低级别。

# H1

## H2

### H3

#### H4

##### H5

###### H6

## 段落

这是一个普通的段落。写作时不用刻意控制每行的长度，Markdown 会自动处理换行与段落间距。中文排版里，段与段之间留出适当的呼吸感，长文的阅读体验会好很多——这也是我在这个博客里反复调整过好几版行高和字距之后得出的结论。

这是一个较短的段落。多个段落之间空一行即可，无需任何额外标记。

## 图片

### 语法

```markdown
![替代文本](./图片的完整或相对路径)
```

### 输出

![博客占位图](/blog-placeholder-about.jpg)

## 引用块

引用块元素表示引自其他来源的内容，可以选择附带出处引用（需放在 `footer` 或 `cite` 元素中），也可以选择包含行内修改，例如注释和缩写。

### 不带出处的引用块

#### 语法

```markdown
> 写作就是把网状的思考，织成线性的文字。  
> **注意**，引用块里也可以使用 _Markdown 语法_。
```

#### 输出

> 写作就是把网状的思考，织成线性的文字。  
> **注意**，引用块里也可以使用 _Markdown 语法_。

### 带出处的引用块

#### 语法

```markdown
> 不要通过共享内存来通信，而要通过通信来共享内存。<br>
> — <cite>Rob Pike[^1]</cite>
```

#### 输出

> 不要通过共享内存来通信，而要通过通信来共享内存。<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: 上面的引用摘自 Rob Pike 于 2015 年 11 月 18 日在 Gopherfest 上的[演讲](https://www.youtube.com/watch?v=PAAkCSZUG1c)。

## 表格

### 语法

```markdown
| 斜体     | 加粗     | 代码   |
| --------- | -------- | ------ |
| _斜体_    | **加粗** | `代码` |
```

### 输出

| 斜体     | 加粗     | 代码   |
| --------- | -------- | ------ |
| _斜体_    | **加粗** | `代码` |

## 代码块

### 语法

我们可以另起一行输入三个反引号 ``` 来开始代码块，写入代码片段后，再另起一行用三个反引号结束。如果要高亮特定语言的语法，就在第一组三个反引号后面写上语言名称，例如 html、javascript、css、markdown、typescript、txt、bash。

````markdown
```html
<!doctype html>
<html lang="zh-CN">
	<head>
		<meta charset="utf-8" />
		<title>HTML5 文档示例</title>
	</head>
	<body>
		<p>测试</p>
	</body>
</html>
```
````

### 输出

```html
<!doctype html>
<html lang="zh-CN">
	<head>
		<meta charset="utf-8" />
		<title>HTML5 文档示例</title>
	</head>
	<body>
		<p>测试</p>
	</body>
</html>
```

## 列表类型

### 有序列表

#### 语法

```markdown
1. 第一项
2. 第二项
3. 第三项
```

#### 输出

1. 第一项
2. 第二项
3. 第三项

### 无序列表

#### 语法

```markdown
- 列表项
- 另一个列表项
- 还有一个列表项
```

#### 输出

- 列表项
- 另一个列表项
- 还有一个列表项

### 嵌套列表

#### 语法

```markdown
- 水果
  - 苹果
  - 橙子
  - 香蕉
- 乳制品
  - 牛奶
  - 奶酪
```

#### 输出

- 水果
  - 苹果
  - 橙子
  - 香蕉
- 乳制品
  - 牛奶
  - 奶酪

## 其他元素 — abbr、sub、sup、kbd、mark

### 语法

```markdown
<abbr title="图形交换格式">GIF</abbr> 是一种位图图像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> 结束会话。

大多数<mark>蝾螈</mark>是夜行动物，会捕食昆虫、蠕虫和其他小生物。
```

### 输出

<abbr title="图形交换格式">GIF</abbr> 是一种位图图像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> 结束会话。

大多数<mark>蝾螈</mark>是夜行动物，会捕食昆虫、蠕虫和其他小生物。
', '<p>这篇文章既是我的 Markdown 语法备忘，也是这个博客排版能力的完整演示——所有能用的语法都能在这篇文章里看到实际效果。</p>
<h2 id="标题" tabindex="-1">标题</h2>
<p>下面的 HTML <code>&lt;h1&gt;</code>—<code>&lt;h6&gt;</code> 元素表示六个级别的章节标题。<code>&lt;h1&gt;</code> 是最高级别的标题，而 <code>&lt;h6&gt;</code> 是最低级别。</p>
<h1 id="h1" tabindex="-1">H1</h1>
<h2 id="h2" tabindex="-1">H2</h2>
<h3 id="h3" tabindex="-1">H3</h3>
<h4 id="h4" tabindex="-1">H4</h4>
<h5 id="h5" tabindex="-1">H5</h5>
<h6 id="h6" tabindex="-1">H6</h6>
<h2 id="段落" tabindex="-1">段落</h2>
<p>这是一个普通的段落。写作时不用刻意控制每行的长度，Markdown 会自动处理换行与段落间距。中文排版里，段与段之间留出适当的呼吸感，长文的阅读体验会好很多——这也是我在这个博客里反复调整过好几版行高和字距之后得出的结论。</p>
<p>这是一个较短的段落。多个段落之间空一行即可，无需任何额外标记。</p>
<h2 id="图片" tabindex="-1">图片</h2>
<h3 id="语法" tabindex="-1">语法</h3>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">![</span><span style="color:#032F62;--shiki-light-text-decoration:underline;--shiki-dark:#DBEDFF;--shiki-dark-text-decoration:underline">替代文本</span><span style="color:#24292E;--shiki-dark:#E1E4E8">](</span><span style="color:#24292E;--shiki-light-text-decoration:underline;--shiki-dark:#E1E4E8;--shiki-dark-text-decoration:underline">./图片的完整或相对路径</span><span style="color:#24292E;--shiki-dark:#E1E4E8">)</span></span>
<span class="line"></span></code></pre><h3 id="输出" tabindex="-1">输出</h3>
<p><img src="/blog-placeholder-about.jpg" alt="博客占位图"></p>
<h2 id="引用块" tabindex="-1">引用块</h2>
<p>引用块元素表示引自其他来源的内容，可以选择附带出处引用（需放在 <code>footer</code> 或 <code>cite</code> 元素中），也可以选择包含行内修改，例如注释和缩写。</p>
<h3 id="不带出处的引用块" tabindex="-1">不带出处的引用块</h3>
<h4 id="语法-1" tabindex="-1">语法</h4>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#22863A;--shiki-dark:#85E89D">> 写作就是把网状的思考，织成线性的文字。  </span></span>
<span class="line"><span style="color:#22863A;--shiki-dark:#85E89D">> </span><span style="color:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold">**注意**</span><span style="color:#22863A;--shiki-dark:#85E89D">，引用块里也可以使用 </span><span style="color:#24292E;--shiki-light-font-style:italic;--shiki-dark:#E1E4E8;--shiki-dark-font-style:italic">_Markdown 语法_</span><span style="color:#22863A;--shiki-dark:#85E89D">。</span></span>
<span class="line"></span></code></pre><h4 id="输出-1" tabindex="-1">输出</h4>
<blockquote>
<p>写作就是把网状的思考，织成线性的文字。<br>
<strong>注意</strong>，引用块里也可以使用 <em>Markdown 语法</em>。</p>
</blockquote>
<h3 id="带出处的引用块" tabindex="-1">带出处的引用块</h3>
<h4 id="语法-2" tabindex="-1">语法</h4>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#22863A;--shiki-dark:#85E89D">> 不要通过共享内存来通信，而要通过通信来共享内存。&#x3C;br></span></span>
<span class="line"><span style="color:#22863A;--shiki-dark:#85E89D">> — &#x3C;cite>Rob Pike[</span><span style="color:#032F62;--shiki-light-text-decoration:underline;--shiki-dark:#DBEDFF;--shiki-dark-text-decoration:underline">^1</span><span style="color:#22863A;--shiki-dark:#85E89D">]&#x3C;/cite></span></span>
<span class="line"></span></code></pre><h4 id="输出-2" tabindex="-1">输出</h4>
<blockquote>
<p>不要通过共享内存来通信，而要通过通信来共享内存。<br>
— <cite>Rob Pike[^1]</cite></p>
</blockquote>
<p>[^1]: 上面的引用摘自 Rob Pike 于 2015 年 11 月 18 日在 Gopherfest 上的<a href="https://www.youtube.com/watch?v=PAAkCSZUG1c">演讲</a>。</p>
<h2 id="表格" tabindex="-1">表格</h2>
<h3 id="语法-3" tabindex="-1">语法</h3>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">| 斜体     | 加粗     | 代码   |</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">| --------- | -------- | ------ |</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">| </span><span style="color:#24292E;--shiki-light-font-style:italic;--shiki-dark:#E1E4E8;--shiki-dark-font-style:italic">_斜体_</span><span style="color:#24292E;--shiki-dark:#E1E4E8">    | </span><span style="color:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold">**加粗**</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> | </span><span style="color:#005CC5;--shiki-dark:#79B8FF">`代码`</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> |</span></span>
<span class="line"></span></code></pre><h3 id="输出-3" tabindex="-1">输出</h3>
<table>
<thead>
<tr>
<th>斜体</th>
<th>加粗</th>
<th>代码</th>
</tr>
</thead>
<tbody>
<tr>
<td><em>斜体</em></td>
<td><strong>加粗</strong></td>
<td><code>代码</code></td>
</tr>
</tbody>
</table>
<h2 id="代码块" tabindex="-1">代码块</h2>
<h3 id="语法-4" tabindex="-1">语法</h3>
<p>我们可以另起一行输入三个反引号 ``` 来开始代码块，写入代码片段后，再另起一行用三个反引号结束。如果要高亮特定语言的语法，就在第一组三个反引号后面写上语言名称，例如 html、javascript、css、markdown、typescript、txt、bash。</p>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">```html</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;!</span><span style="color:#22863A;--shiki-dark:#85E89D">doctype</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> html</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">html</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> lang</span><span style="color:#24292E;--shiki-dark:#E1E4E8">=</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"zh-CN"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">head</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">		&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">meta</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> charset</span><span style="color:#24292E;--shiki-dark:#E1E4E8">=</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"utf-8"</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> /></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">		&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">title</span><span style="color:#24292E;--shiki-dark:#E1E4E8">>HTML5 文档示例&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">title</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">head</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">body</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">		&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">p</span><span style="color:#24292E;--shiki-dark:#E1E4E8">>测试&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">p</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">body</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">html</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">```</span></span>
<span class="line"></span></code></pre><h3 id="输出-4" tabindex="-1">输出</h3>
<pre class="astro-code shiki language-html" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;!</span><span style="color:#22863A;--shiki-dark:#85E89D">doctype</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> html</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">html</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> lang</span><span style="color:#24292E;--shiki-dark:#E1E4E8">=</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"zh-CN"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">head</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">		&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">meta</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> charset</span><span style="color:#24292E;--shiki-dark:#E1E4E8">=</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"utf-8"</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> /></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">		&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">title</span><span style="color:#24292E;--shiki-dark:#E1E4E8">>HTML5 文档示例&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">title</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">head</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">body</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">		&#x3C;</span><span style="color:#22863A;--shiki-dark:#85E89D">p</span><span style="color:#24292E;--shiki-dark:#E1E4E8">>测试&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">p</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">body</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;/</span><span style="color:#22863A;--shiki-dark:#85E89D">html</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"></span></code></pre><h2 id="列表类型" tabindex="-1">列表类型</h2>
<h3 id="有序列表" tabindex="-1">有序列表</h3>
<h4 id="语法-5" tabindex="-1">语法</h4>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">1.</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 第一项</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">2.</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 第二项</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">3.</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 第三项</span></span>
<span class="line"></span></code></pre><h4 id="输出-5" tabindex="-1">输出</h4>
<ol>
<li>第一项</li>
<li>第二项</li>
<li>第三项</li>
</ol>
<h3 id="无序列表" tabindex="-1">无序列表</h3>
<h4 id="语法-6" tabindex="-1">语法</h4>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">-</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 列表项</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">-</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 另一个列表项</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">-</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 还有一个列表项</span></span>
<span class="line"></span></code></pre><h4 id="输出-6" tabindex="-1">输出</h4>
<ul>
<li>列表项</li>
<li>另一个列表项</li>
<li>还有一个列表项</li>
</ul>
<h3 id="嵌套列表" tabindex="-1">嵌套列表</h3>
<h4 id="语法-7" tabindex="-1">语法</h4>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">-</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 水果</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">  -</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 苹果</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">  -</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 橙子</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">  -</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 香蕉</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">-</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 乳制品</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">  -</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 牛奶</span></span>
<span class="line"><span style="color:#E36209;--shiki-dark:#FFAB70">  -</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> 奶酪</span></span>
<span class="line"></span></code></pre><h4 id="输出-7" tabindex="-1">输出</h4>
<ul>
<li>水果
<ul>
<li>苹果</li>
<li>橙子</li>
<li>香蕉</li>
</ul>
</li>
<li>乳制品
<ul>
<li>牛奶</li>
<li>奶酪</li>
</ul>
</li>
</ul>
<h2 id="其他元素--abbrsubsupkbdmark" tabindex="-1">其他元素 — abbr、sub、sup、kbd、mark</h2>
<h3 id="语法-8" tabindex="-1">语法</h3>
<pre class="astro-code shiki language-markdown" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;abbr title="图形交换格式">GIF&#x3C;/abbr> 是一种位图图像格式。</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">H&#x3C;sub>2&#x3C;/sub>O</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">X&#x3C;sup>n&#x3C;/sup> + Y&#x3C;sup>n&#x3C;/sup> = Z&#x3C;sup>n&#x3C;/sup></span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">按 &#x3C;kbd>CTRL&#x3C;/kbd> + &#x3C;kbd>ALT&#x3C;/kbd> + &#x3C;kbd>Delete&#x3C;/kbd> 结束会话。</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">大多数&#x3C;mark>蝾螈&#x3C;/mark>是夜行动物，会捕食昆虫、蠕虫和其他小生物。</span></span>
<span class="line"></span></code></pre><h3 id="输出-8" tabindex="-1">输出</h3>
<p><abbr title="图形交换格式">GIF</abbr> 是一种位图图像格式。</p>
<p>H<sub>2</sub>O</p>
<p>X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup></p>
<p>按 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> 结束会话。</p>
<p>大多数<mark>蝾螈</mark>是夜行动物，会捕食昆虫、蠕虫和其他小生物。</p>
', '/blog-placeholder-1.jpg', 'published', 1718726400000, NULL, 3, NULL, 1718726400000, NULL),
('second-post', '慢下来，才能走得远', '关于节奏、焦虑与长期主义的一点个人体会。', '
有一段时间，我的收藏夹里堆满了"三十天学会 XX""高效人士的十个习惯"，订阅的科技媒体每天推送着谁谁又融资了、谁谁又财务自由了。看得越多，越焦虑；越焦虑，越想找捷径；越找捷径，越一事无成。

后来我做了一个实验：把所有的信息流都关掉一个月。

## 世界并没有因此抛下我

一个月后打开那些 App，热榜上的话题换了一轮又一轮，但没有一件事真正和我有关。我错过的大概只有谈资，而谈资是世界上最不值钱的东西之一。

省下来的时间，我读完了两本一直"没时间"读的书，把搁置半年的小项目写出了第一个能跑的版本。原来我缺的从来不是时间，而是注意力。

## 找到自己的节奏

现在的我大概是这样生活的：

- 早晨不看手机，先写半小时东西，写什么都行
- 每周留一个"无屏幕晚上"，读书、跑步或者发呆
- 学东西不赶进度，一个知识点搞不懂就停下来，搞懂再走

这些习惯谈不上多高明，但它们让我从"追赶"的状态里走了出来。人生不是限时竞速，**能按自己的节奏走完的人，往往走得最远。**

## 写在最后

这篇没有任何方法论，只是一个人从焦虑里爬出来的过程记录。如果屏幕前的你也正被信息流裹挟着喘不过气，不妨试试关掉它们几天——世界真的不会塌。
', '<p>有一段时间，我的收藏夹里堆满了&quot;三十天学会 XX&quot;“高效人士的十个习惯”，订阅的科技媒体每天推送着谁谁又融资了、谁谁又财务自由了。看得越多，越焦虑；越焦虑，越想找捷径；越找捷径，越一事无成。</p>
<p>后来我做了一个实验：把所有的信息流都关掉一个月。</p>
<h2 id="世界并没有因此抛下我" tabindex="-1">世界并没有因此抛下我</h2>
<p>一个月后打开那些 App，热榜上的话题换了一轮又一轮，但没有一件事真正和我有关。我错过的大概只有谈资，而谈资是世界上最不值钱的东西之一。</p>
<p>省下来的时间，我读完了两本一直&quot;没时间&quot;读的书，把搁置半年的小项目写出了第一个能跑的版本。原来我缺的从来不是时间，而是注意力。</p>
<h2 id="找到自己的节奏" tabindex="-1">找到自己的节奏</h2>
<p>现在的我大概是这样生活的：</p>
<ul>
<li>早晨不看手机，先写半小时东西，写什么都行</li>
<li>每周留一个&quot;无屏幕晚上&quot;，读书、跑步或者发呆</li>
<li>学东西不赶进度，一个知识点搞不懂就停下来，搞懂再走</li>
</ul>
<p>这些习惯谈不上多高明，但它们让我从&quot;追赶&quot;的状态里走了出来。人生不是限时竞速，<strong>能按自己的节奏走完的人，往往走得最远。</strong></p>
<h2 id="写在最后" tabindex="-1">写在最后</h2>
<p>这篇没有任何方法论，只是一个人从焦虑里爬出来的过程记录。如果屏幕前的你也正被信息流裹挟着喘不过气，不妨试试关掉它们几天——世界真的不会塌。</p>
', '/blog-placeholder-4.jpg', 'published', 1657814400000, NULL, 1, NULL, 1657814400000, NULL),
('third-post', '把过程写下来，是最好的复盘', '为什么我坚持记录每一次踩坑，而不是只收藏答案。', '
前几天翻到三年前的一篇工作笔记，里面记着一个当时折磨了我两天的 bug。我已经完全忘了那个 bug 本身，但笔记里那句"最后发现是配置文件少了一个逗号"让我笑出了声——也为当时的自己感到心疼。

这让我更加确信一件事：**记录过程，比收藏答案有价值得多。**

## 答案会过期，过程不会

搜索引擎能给我们答案，但给不了我们"为什么会想到这个答案"。技术更新这么快，今天背下的解法明年可能就过时了；可排查问题的思路、走的弯路、排除掉的错误方向，这些是可以迁移的资产。

所以我后来给自己立了个规矩：每解决一个折腾超过一小时的问题，就写一篇复盘。哪怕写得啰嗦，哪怕以后看会很幼稚。

## 复盘让坑变成台阶

不写下来，坑就只是坑；写下来，坑就成了台阶。

写的过程中我经常发现：原来当时卡住我的不是那个技术问题，而是我对某个概念的误解。把这个误解摊开写清楚，比看十篇教程都管用。这也是为什么我敢把这个博客里相当一部分内容拿出来公开——我赌世界上不止我一个人这么误解过。

## 一个小建议

如果你也有"解决了就忘、下次再踩"的困扰，不妨从今天开始，把解决问题的过程随手记下来。不用写成教程，就像给三个月后的自己留一张字条就够了。

三个月后的你，会感谢现在的你的。
', '<p>前几天翻到三年前的一篇工作笔记，里面记着一个当时折磨了我两天的 bug。我已经完全忘了那个 bug 本身，但笔记里那句&quot;最后发现是配置文件少了一个逗号&quot;让我笑出了声——也为当时的自己感到心疼。</p>
<p>这让我更加确信一件事：<strong>记录过程，比收藏答案有价值得多。</strong></p>
<h2 id="答案会过期过程不会" tabindex="-1">答案会过期，过程不会</h2>
<p>搜索引擎能给我们答案，但给不了我们&quot;为什么会想到这个答案&quot;。技术更新这么快，今天背下的解法明年可能就过时了；可排查问题的思路、走的弯路、排除掉的错误方向，这些是可以迁移的资产。</p>
<p>所以我后来给自己立了个规矩：每解决一个折腾超过一小时的问题，就写一篇复盘。哪怕写得啰嗦，哪怕以后看会很幼稚。</p>
<h2 id="复盘让坑变成台阶" tabindex="-1">复盘让坑变成台阶</h2>
<p>不写下来，坑就只是坑；写下来，坑就成了台阶。</p>
<p>写的过程中我经常发现：原来当时卡住我的不是那个技术问题，而是我对某个概念的误解。把这个误解摊开写清楚，比看十篇教程都管用。这也是为什么我敢把这个博客里相当一部分内容拿出来公开——我赌世界上不止我一个人这么误解过。</p>
<h2 id="一个小建议" tabindex="-1">一个小建议</h2>
<p>如果你也有&quot;解决了就忘、下次再踩&quot;的困扰，不妨从今天开始，把解决问题的过程随手记下来。不用写成教程，就像给三个月后的自己留一张字条就够了。</p>
<p>三个月后的你，会感谢现在的你的。</p>
', '/blog-placeholder-2.jpg', 'published', 1658419200000, NULL, 1, NULL, 1658419200000, NULL),
('using-mdx', '用 MDX 写博客是什么体验', '在 Markdown 里直接嵌入组件——我选择 MDX 作为博客写作格式的原因。', '
这个博客的写作格式是 MDX。简单说，它就是"会写组件的 Markdown"——在正文里可以直接 import 并渲染 UI 组件，而不是只能贴静态代码块。

## 为什么我选了 MDX

普通的 Markdown 足以覆盖 95% 的写作场景，但剩下那 5% 很折磨人：想放一个可交互的演示、一个带状态的按钮、一个动态生成的图表，就只能截一张图，然后眼睁睁看着它过时。

MDX 把这 5% 补上了：它支持嵌入 JavaScript 和 JSX 语法，可以[把组件和逻辑直接混进 Markdown 内容](https://mdxjs.com/docs/what-is-mdx/)里，文字和代码终于活在同一个文件里。

## 一个实际的例子

在 MDX 里嵌入组件大概长这样——写的时候是代码，渲染出来就是真正可以点击的元素：

```mdx
import HeaderLink from "../../components/HeaderLink.astro";

<HeaderLink href="#" onclick="alert(''clicked!'')">
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
', '<p>这个博客的写作格式是 MDX。简单说，它就是&quot;会写组件的 Markdown&quot;——在正文里可以直接 import 并渲染 UI 组件，而不是只能贴静态代码块。</p>
<h2 id="为什么我选了-mdx" tabindex="-1">为什么我选了 MDX</h2>
<p>普通的 Markdown 足以覆盖 95% 的写作场景，但剩下那 5% 很折磨人：想放一个可交互的演示、一个带状态的按钮、一个动态生成的图表，就只能截一张图，然后眼睁睁看着它过时。</p>
<p>MDX 把这 5% 补上了：它支持嵌入 JavaScript 和 JSX 语法，可以<a href="https://mdxjs.com/docs/what-is-mdx/">把组件和逻辑直接混进 Markdown 内容</a>里，文字和代码终于活在同一个文件里。</p>
<h2 id="一个实际的例子" tabindex="-1">一个实际的例子</h2>
<p>在 MDX 里嵌入组件大概长这样——写的时候是代码，渲染出来就是真正可以点击的元素：</p>
<pre class="astro-code shiki language-mdx" shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#D73A49;--shiki-dark:#F97583">import</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> HeaderLink </span><span style="color:#D73A49;--shiki-dark:#F97583">from</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> "../../components/HeaderLink.astro"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;</span><span style="color:#005CC5;--shiki-dark:#79B8FF">HeaderLink</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> href</span><span style="color:#D73A49;--shiki-dark:#F97583">=</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"#"</span><span style="color:#6F42C1;--shiki-dark:#B392F0"> onclick</span><span style="color:#D73A49;--shiki-dark:#F97583">=</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"alert(''clicked!'')"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">	文章里嵌入的组件</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x3C;/</span><span style="color:#005CC5;--shiki-dark:#79B8FF">HeaderLink</span><span style="color:#24292E;--shiki-dark:#E1E4E8">></span></span>
<span class="line"></span></code></pre><p>如果我只想&quot;说明&quot;这个按钮的行为，贴张图就够了；但既然可以让你亲手点一下，为什么不呢？</p>
<h2 id="一点使用心得" tabindex="-1">一点使用心得</h2>
<ul>
<li><strong>组件是手段，不是目的。</strong> 大部分文章依然是纯文字，只有真正需要交互时才动用组件，否则维护成本会吃掉写作的乐趣</li>
<li><strong>静态优先。</strong> 不加特殊声明的话，MDX 里的组件默认渲染成纯 HTML（没有 JavaScript），需要交互时再显式开启水合——对博客这种内容站非常友好</li>
<li><strong>适合的才是好的。</strong> 如果你的博客只有文字，普通 Markdown 完全够用，不必为了 MDX 而 MDX</li>
</ul>
<h2 id="延伸阅读" tabindex="-1">延伸阅读</h2>
<ul>
<li><a href="https://mdxjs.com/docs/what-is-mdx">MDX 语法文档</a></li>
<li><a href="/blog/markdown-style-guide/">我的 Markdown 写作语法指南</a>——下一篇就说说这个博客里常用的排版语法</li>
</ul>
', '/blog-placeholder-5.jpg', 'published', 1717171200000, NULL, 1, NULL, 1717171200000, NULL);
INSERT INTO tags (name, slug) VALUES
('随笔', '随笔'),
('开始', '开始'),
('Markdown', 'markdown'),
('写作', '写作'),
('技术', '技术'),
('生活', '生活'),
('思考', '思考'),
('MDX', 'mdx');
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4),
(2, 5),
(3, 1),
(3, 6),
(4, 1),
(4, 7),
(5, 8),
(5, 4),
(5, 5);
INSERT OR IGNORE INTO settings (key, value) VALUES ('seeded_at', '2026-08-25T12:48:12.306Z');