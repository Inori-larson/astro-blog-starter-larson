import type { APIRoute } from 'astro';
import { desc, eq, isNull, and } from 'drizzle-orm';
import { getDb } from '../../../../lib/db';
import { posts } from '../../../../db/schema';
import { requireAdmin } from '../../../../lib/auth';
import { renderMarkdown, readingTimeMinutes } from '../../../../lib/markdown';
import { invalidateCache } from '../../../../lib/cache';
import GithubSlugger from 'github-slugger';

export const prerender = false;

/** 管理端文章列表（含草稿，不含已删除） */
export const GET: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const db = getDb({ locals });
	const rows = await db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			status: posts.status,
			publishedAt: posts.publishedAt,
			updatedAt: posts.updatedAt,
			readingMinutes: posts.readingMinutes,
		})
		.from(posts)
		.where(isNull(posts.deletedAt))
		.orderBy(desc(posts.publishedAt));
	return Response.json({ items: rows });
};

interface PostInput {
	slug?: string;
	title?: string;
	description?: string;
	contentMd?: string;
	heroImage?: string;
	status?: 'draft' | 'published';
	tags?: string[];
	publishedAt?: string;
}

/** 新建文章 */
export const POST: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	let body: PostInput;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: '请求体格式错误' }, { status: 400 });
	}

	if (!body.title?.trim()) return Response.json({ error: '标题不能为空' }, { status: 400 });
	if (!body.contentMd?.trim()) return Response.json({ error: '内容不能为空' }, { status: 400 });

	// slug：默认从标题生成（中文标题转拼音不可行，回退为 post-{时间戳}，可手动指定）
	const slugger = new GithubSlugger();
	const slug =
		body.slug?.trim() ||
		(slugger.slug(body.title).replace(/[^a-z0-9-]/g, '') || `post-${Date.now().toString(36)}`);
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return Response.json({ error: 'slug 只能包含小写字母、数字和连字符' }, { status: 400 });
	}

	const db = getDb({ locals });
	const exists = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
	if (exists.length) return Response.json({ error: `slug「${slug}」已存在` }, { status: 409 });

	const { html } = await renderMarkdown(body.contentMd);
	const status = body.status === 'draft' ? 'draft' : 'published';
	const publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();

	const [row] = await db
		.insert(posts)
		.values({
			slug,
			title: body.title.trim(),
			description: body.description?.trim() ?? '',
			contentMd: body.contentMd,
			contentHtml: html,
			heroImage: body.heroImage?.trim() || null,
			status,
			publishedAt,
			readingMinutes: readingTimeMinutes(body.contentMd),
			authorId: guard.session.uid,
		})
		.returning({ id: posts.id, slug: posts.slug });

	await syncTags(db, row.id, body.tags ?? []);
	if (status === 'published') await invalidateCache({ locals });
	return Response.json({ ok: true, id: row.id, slug: row.slug }, { status: 201 });
};

/** 标签同步（内联在此避免循环依赖） */
async function syncTags(db: ReturnType<typeof getDb>, postId: number, tagNames: string[]) {
	const { postTags, tags } = await import('../../../../db/schema');
	await db.delete(postTags).where(eq(postTags.postId, postId));
	if (!tagNames.length) return;
	const slugger = new GithubSlugger();
	for (const name of tagNames.map((t) => t.trim()).filter(Boolean).slice(0, 10)) {
		const slug = slugger.slug(name);
		const [existing] = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, name)).limit(1);
		let tagId = existing?.id;
		if (!tagId) {
			const [created] = await db.insert(tags).values({ name, slug }).returning({ id: tags.id });
			tagId = created.id;
		}
		await db.insert(postTags).values({ postId, tagId });
	}
}
