import { getDb } from '../lib/db';
import { cached } from '../lib/cache';
import { listSearchDocs } from '../lib/posts';
import { stripMarkdown } from '../lib/markdown';

export const prerender = false;

export async function GET(context: { locals: App.Locals; site: URL | undefined }) {
	const db = getDb(context);
	const docs = await cached(context, 'search:index', 300, async () => {
		const rows = await listSearchDocs(db);
		return rows.map((r) => ({
			slug: r.slug,
			url: `/blog/${r.slug}/`,
			title: r.title,
			description: r.description,
			tags: r.tags,
			date: r.publishedAt.toISOString(),
			body: stripMarkdown(r.contentMd).slice(0, 8000),
		}));
	});

	return new Response(JSON.stringify(docs), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=300',
		},
	});
}
