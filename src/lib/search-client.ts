/** 客户端全文搜索引擎：对构建时生成的 JSON 索引进行匹配打分 */

export interface SearchDoc {
	slug: string;
	url: string;
	title: string;
	description: string;
	tags: string[];
	date: string;
	body: string;
}

export interface SearchHit {
	doc: SearchDoc;
	score: number;
	snippet: string;
}

export function escapeHtml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function loadIndex(): Promise<SearchDoc[]> {
	const res = await fetch('/search-index.json');
	if (!res.ok) return [];
	return res.json();
}

/**
 * 混合中英文搜索：
 * - 多关键词之间为「与」关系（全部命中才返回）
 * - 打分：标题 > 标签 > 描述 > 正文（按出现次数）
 * - 中文直接子串匹配，英文统一小写
 */
export function runSearch(docs: SearchDoc[], query: string): SearchHit[] {
	const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	if (!terms.length) return [];

	const hits: SearchHit[] = [];
	for (const doc of docs) {
		const title = doc.title.toLowerCase();
		const description = doc.description.toLowerCase();
		const tags = doc.tags.map((t) => t.toLowerCase());
		const body = doc.body.toLowerCase();

		let score = 0;
		let firstIdx = -1;
		let matchedAll = true;

		for (const term of terms) {
			let termScore = 0;
			if (title.includes(term)) termScore += 100;
			if (title.startsWith(term)) termScore += 50;
			if (tags.some((t) => t.includes(term))) termScore += 40;
			if (description.includes(term)) termScore += 20;
			termScore += Math.min(body.split(term).length - 1, 20) * 5;
			if (termScore === 0) {
				matchedAll = false;
				break;
			}
			score += termScore;
			const idx = body.indexOf(term);
			if (idx >= 0 && (firstIdx < 0 || idx < firstIdx)) firstIdx = idx;
		}
		if (!matchedAll || score <= 0) continue;

		let snippet = doc.description;
		if (firstIdx >= 0) {
			const start = Math.max(0, firstIdx - 24);
			const end = Math.min(doc.body.length, firstIdx + 80);
			const prefix = start > 0 ? '…' : '';
			const suffix = end < doc.body.length ? '…' : '';
			snippet =
				prefix + doc.body.slice(start, end).replace(/\s+/g, ' ').trim() + suffix;
		}
		hits.push({ doc, score, snippet });
	}
	return hits.sort((a, b) => b.score - a.score).slice(0, 8);
}

/** 转义 HTML 后用 <mark> 包裹命中片段（返回安全的 HTML 字符串） */
export function highlight(text: string, terms: string[]): string {
	const html = escapeHtml(text);
	const pattern = terms
		.filter(Boolean)
		.map((t) => escapeHtml(escapeRegExp(t)))
		.join('|');
	if (!pattern) return html;
	const re = new RegExp(`(${pattern})`, 'gi');
	return html.replace(
		re,
		(m) =>
			`<mark class="rounded-sm bg-brand-100 px-0.5 text-brand-700 dark:bg-brand-500/25 dark:text-brand-300">${m}</mark>`,
	);
}
