import type { APIRoute } from 'astro';
import { desc, eq, isNull } from 'drizzle-orm';
import { getDb } from '../../../lib/db';
import { comments, posts } from '../../../db/schema';
import { requireAdmin } from '../../../lib/auth';

export const prerender = false;

/** 全部评论（管理端，按时间倒序；排除已删除文章的评论） */
export const GET: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const db = getDb({ locals });
	const rows = await db
		.select({
			id: comments.id,
			postId: comments.postId,
			postTitle: posts.title,
			postSlug: posts.slug,
			parentId: comments.parentId,
			authorName: comments.authorName,
			content: comments.content,
			status: comments.status,
			createdAt: comments.createdAt,
		})
		.from(comments)
		.innerJoin(posts, eq(posts.id, comments.postId))
		.where(isNull(posts.deletedAt))
		.orderBy(desc(comments.createdAt))
		.limit(200);
	return Response.json({ items: rows });
};

/** 审核：更新评论状态 / 删除（评论不在页面缓存内，无需失效缓存） */
export const PUT: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	let body: { id?: number; action?: string };
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: '请求体格式错误' }, { status: 400 });
	}

	const id = Number(body.id);
	if (!Number.isInteger(id)) return Response.json({ error: '无效 id' }, { status: 400 });

	const db = getDb({ locals });
	if (body.action === 'delete') {
		await db.delete(comments).where(eq(comments.id, id));
	} else if (body.action === 'approve' || body.action === 'pending' || body.action === 'spam') {
		const map: Record<string, 'approved' | 'pending' | 'spam'> = {
			approve: 'approved',
			pending: 'pending',
			spam: 'spam',
		};
		await db.update(comments).set({ status: map[body.action] }).where(eq(comments.id, id));
	} else {
		return Response.json({ error: '未知操作' }, { status: 400 });
	}

	return Response.json({ ok: true });
};
