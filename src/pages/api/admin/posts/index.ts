import type { APIRoute } from 'astro';
import { desc, eq, isNull, and } from 'drizzle-orm';
import GithubSlugger from 'github-slugger';
import { getDb } from '../../../../lib/db';
import { posts } from '../../../../db/schema';
import { requireAdmin } from '../../../../lib/auth';
import { renderMarkdown, readingTimeMinutes } from '../../../../lib/markdown';
import { invalidateCache } from '../../../../lib/cache';
import { syncTags } from '../../../../lib/tags';

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
	if (body.title.trim().length > 200) return Response.json({ error: '标题不能超过 200 字' }, { status: 400 });
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
	// 唯一性只对未删除文章校验（软删的 slug 可复用）
	const exists = await db
		.select({ id: posts.id })
		.from(posts)
		.where(and(eq(posts.slug, slug), isNull(posts.deletedAt)))
		.limit(1);
	if (exists.length) return Response.json({ error: `slug「${slug}」已存在` }, { status: 409 });

	const { html } = await renderMarkdown(body.contentMd);
	const status = body.status === 'draft' ? 'draft' : 'published';
	let publishedAt = new Date();
	if (body.publishedAt) {
		const d = new Date(String(body.publishedAt));
		if (Number.isNaN(d.getTime())) return Response.json({ error: '发布日期格式不正确' }, { status: 400 });
		publishedAt = d;
	}

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
	if (status === 'published') {
		await invalidateCache({ locals });
		// 通知已验证订阅者：挂 waitUntil 保证响应后继续执行（未配置 RESEND_API_KEY 时静默跳过）
		locals.runtime.ctx?.waitUntil?.(
			notifySubscribers(locals, {
				title: body.title.trim(),
				description: body.description?.trim() ?? '',
				slug: row.slug,
			}),
		);
	}
	return Response.json({ ok: true, id: row.id, slug: row.slug }, { status: 201 });
};

/** 给已验证订阅者群发新文章通知（失败仅记日志，不影响发布） */
async function notifySubscribers(
	locals: App.Locals,
	post: { title: string; description: string; slug: string },
): Promise<void> {
	try {
		const env = locals.runtime.env as { RESEND_API_KEY?: string };
		if (!env.RESEND_API_KEY) return;
		const { subscribers } = await import('../../../../db/schema');
		const { sendNewPostBatch } = await import('../../../../lib/mail');
		const db = getDb({ locals });
		const rows = await db
			.select({ email: subscribers.email })
			.from(subscribers)
			.where(eq(subscribers.verified, true));
		if (!rows.length) return;
		const result = await sendNewPostBatch(
			env,
			rows.map((r) => r.email),
			post,
		);
		if (!result.ok) console.error('[notify] 新文章邮件发送失败:', result.error);
	} catch (e) {
		console.error('[notify] 新文章通知异常:', e instanceof Error ? e.message : String(e));
	}
}
