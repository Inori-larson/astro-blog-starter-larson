import type { APIRoute } from 'astro';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '../../../../lib/db';
import { posts, postTags, tags } from '../../../../db/schema';
import { requireAdmin } from '../../../../lib/auth';
import { renderMarkdown, readingTimeMinutes } from '../../../../lib/markdown';
import { invalidateCache } from '../../../../lib/cache';
import GithubSlugger from 'github-slugger';

export const prerender = false;

type Params = { id: string };

/** 单篇文章详情（管理端，含草稿） */
export const GET: APIRoute = async ({ params, request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const id = Number(params.id);
	if (!Number.isInteger(id)) return Response.json({ error: '无效 id' }, { status: 400 });

	const db = getDb({ locals });
	const [post] = await db
		.select()
		.from(posts)
		.where(and(eq(posts.id, id), isNull(posts.deletedAt)))
		.limit(1);
	if (!post) return Response.json({ error: '文章不存在' }, { status: 404 });

	const tagRows = await db
		.select({ name: tags.name })
		.from(postTags)
		.innerJoin(tags, eq(tags.id, postTags.tagId))
		.where(eq(postTags.postId, id));

	return Response.json({ post: { ...post, tags: tagRows.map((t) => t.name) } });
};

/** 更新文章 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const id = Number(params.id);
	if (!Number.isInteger(id)) return Response.json({ error: '无效 id' }, { status: 400 });

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: '请求体格式错误' }, { status: 400 });
	}

	const db = getDb({ locals });
	const [existing] = await db
		.select({ id: posts.id, slug: posts.slug })
		.from(posts)
		.where(and(eq(posts.id, id), isNull(posts.deletedAt)))
		.limit(1);
	if (!existing) return Response.json({ error: '文章不存在' }, { status: 404 });

	if (body.slug) {
		const slug = String(body.slug).trim();
		if (!/^[a-z0-9-]+$/.test(slug)) {
			return Response.json({ error: 'slug 只能包含小写字母、数字和连字符' }, { status: 400 });
		}
		if (slug !== existing.slug) {
			const dup = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
			if (dup.length) return Response.json({ error: `slug「${slug}」已存在` }, { status: 409 });
		}
		body.slug = slug;
	}

	const update: Record<string, unknown> = { updatedAt: new Date() };
	if (body.slug !== undefined) update.slug = body.slug;
	if (body.title !== undefined) update.title = String(body.title).trim();
	if (body.description !== undefined) update.description = String(body.description).trim();
	if (body.heroImage !== undefined) update.heroImage = String(body.heroImage).trim() || null;
	if (body.status !== undefined) update.status = body.status === 'draft' ? 'draft' : 'published';
	if (body.publishedAt !== undefined) update.publishedAt = new Date(String(body.publishedAt));

	if (body.contentMd !== undefined) {
		const contentMd = String(body.contentMd);
		if (!contentMd.trim()) return Response.json({ error: '内容不能为空' }, { status: 400 });
		const { html } = await renderMarkdown(contentMd);
		update.contentMd = contentMd;
		update.contentHtml = html;
		update.readingMinutes = readingTimeMinutes(contentMd);
	}

	await db.update(posts).set(update).where(eq(posts.id, id));

	// 标签
	if (Array.isArray(body.tags)) {
		await db.delete(postTags).where(eq(postTags.postId, id));
		const slugger = new GithubSlugger();
		for (const raw of (body.tags as unknown[]).map((t) => String(t).trim()).filter(Boolean).slice(0, 10)) {
			const slug = slugger.slug(raw);
			const [tagRow] = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, raw)).limit(1);
			let tagId = tagRow?.id;
			if (!tagId) {
				const [created] = await db.insert(tags).values({ name: raw, slug }).returning({ id: tags.id });
				tagId = created.id;
			}
			await db.insert(postTags).values({ postId: id, tagId });
		}
	}

	await invalidateCache({ locals });
	return Response.json({ ok: true });
};

/** 删除文章（软删除） */
export const DELETE: APIRoute = async ({ params, request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const id = Number(params.id);
	if (!Number.isInteger(id)) return Response.json({ error: '无效 id' }, { status: 400 });

	const db = getDb({ locals });
	await db.update(posts).set({ deletedAt: new Date() }).where(eq(posts.id, id));
	await invalidateCache({ locals });
	return Response.json({ ok: true });
};
