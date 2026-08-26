/**
 * 共享 Markdown 渲染器（Astro 应用与 node 种子脚本共用）
 * - markdown-it + 标题锚点（github-slugger，与 Astro 构建时行为一致）
 * - Shiki 双主题代码高亮（github-light / github-dark），输出与 Astro 构建时相同的
 *   CSS 变量结构（--shiki-dark*），并给 <pre> 加 astro-code 类以复用现有样式
 */
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import GithubSlugger from 'github-slugger';
import { createHighlighter, bundledLanguages, createJavaScriptRegexEngine } from 'shiki';

const slugger = new GithubSlugger();

const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
});

md.use(anchor, {
	slugify: (s) => slugger.slug(s),
	permalink: false,
});

let highlighterPromise = null;

async function getHighlighter() {
	if (!highlighterPromise) {
		// Workers 环境禁用 Wasm（oniguruma 引擎不可用），使用 JS 正则引擎
		highlighterPromise = createHighlighter({
			themes: ['github-light', 'github-dark'],
			langs: ['text', 'markdown', 'html', 'javascript', 'typescript', 'css', 'json', 'bash', 'sh', 'yaml', 'sql', 'astro', 'diff'],
			engine: createJavaScriptRegexEngine({ forgiving: true }),
		});
	}
	return highlighterPromise;
}

/** 确保 highlighter 已加载指定语言（未知语言静默跳过） */
async function ensureLanguages(langs) {
	const hl = await getHighlighter();
	const loaded = new Set(hl.getLoadedLanguages());
	for (const lang of langs) {
		if (!lang || loaded.has(lang)) continue;
		if (lang in bundledLanguages) {
			await hl.loadLanguage(lang);
			loaded.add(lang);
		}
	}
}

const defaultFence =
	md.renderer.rules.fence ??
	((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

const state = { highlighter: null };

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
	const token = tokens[idx];
	const lang = (token.info || '').trim().split(/\s+/)[0]?.toLowerCase() || 'text';
	if (env?.__syncHighlight && state.highlighter) {
		const hl = state.highlighter;
		const resolved = hl.getLoadedLanguages().includes(lang) ? lang : 'text';
		const html = hl.codeToHtml(token.content, {
			lang: resolved,
			themes: { light: 'github-light', dark: 'github-dark' },
		});
		// 对齐 Astro 构建输出：astro-code 类 + language-* 类（复制按钮的语言标签用）
		return html.replace(
			'<pre class="shiki',
			`<pre class="astro-code shiki language-${resolved}"`,
		);
	}
	return defaultFence(tokens, idx, options, env, self);
};

/**
 * 渲染 Markdown → { html, headings }
 * headings: [{ depth, slug, text }]（h2/h3，用于 TOC）
 */
export async function renderMarkdown(source) {
	slugger.reset();

	// 1) 预扫描代码块语言并加载
	const tokens = md.parse(source, {});
	const langs = new Set();
	for (const token of tokens) {
		if (token.type === 'fence') {
			const info = (token.info || '').trim().split(/\s+/)[0]?.toLowerCase();
			if (info) langs.add(info);
		}
	}
	await ensureLanguages([...langs]);
	state.highlighter = await getHighlighter();

	// 2) 渲染（env 标记开启同步高亮）
	const html = md.renderer.render(tokens, md.options, { __syncHighlight: true });

	// 3) 提取标题（含 id）
	const headings = [];
	const re = /<h([2-3]) id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/g;
	let m;
	while ((m = re.exec(html)) !== null) {
		headings.push({
			depth: Number(m[1]),
			slug: m[2],
			text: m[3].replace(/<[^>]+>/g, '').trim(),
		});
	}

	return { html, headings };
}

/** 去除 Markdown 语法噪音，保留可搜索纯文本 */
export function stripMarkdown(mdText) {
	return mdText
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]*)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/<\/?[a-z][^>]*>/gi, ' ')
		.replace(/[#>*_~|-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** 估算阅读时长（分钟）：中文 400 字/分钟，其他 200 词/分钟 */
export function readingTimeMinutes(text) {
	const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) ?? []).length;
	const words = text
		.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.round(cjk / 400 + words / 200));
}
