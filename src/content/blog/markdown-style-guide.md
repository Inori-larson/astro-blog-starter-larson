---
title: "Markdown 语法指南"
description: "我在博客写作中常用的 Markdown 语法备忘，也是这个站点排版能力的完整演示。"
pubDate: "Jun 19 2024"
heroImage: "/blog-placeholder-1.jpg"
tags: ["Markdown", "写作", "技术"]
---

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
