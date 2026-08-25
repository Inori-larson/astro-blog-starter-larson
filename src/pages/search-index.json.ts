import { getCollection } from 'astro:content';

/** 去除 Markdown 语法噪音，仅保留可搜索的纯文本 */
function stripMarkdown(md: string): string {
	return md
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]*)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/<\/?[a-z][^>]*>/gi, ' ')
		.replace(/[#>*_~|-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export async function GET() {
	const posts = await getCollection('blog');
	const docs = posts.map((p) => ({
		slug: p.id,
		url: `/blog/${p.id}/`,
		title: p.data.title,
		description: p.data.description,
		tags: p.data.tags,
		date: p.data.pubDate.toISOString(),
		body: stripMarkdown(p.body ?? '').slice(0, 8000),
	}));
	return new Response(JSON.stringify(docs), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
}
