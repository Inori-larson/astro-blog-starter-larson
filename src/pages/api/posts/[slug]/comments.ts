import type { APIRoute } from 'astro';
import { getDb } from '../../../../lib/db';
import { createComment, getPostIdBySlug, listApprovedComments } from '../../../../lib/interactions';
import { ipHash, visitorHash } from '../../../../lib/visitor';
import { rateLimit } from '../../../../lib/rate-limit';

export const prerender = false;

const MAX_CONTENT = 2000;
const MAX_NAME = 40;

/** 评论校验：过滤明显垃圾内容 */
function validate(body: { authorName?: string; authorEmail?: string; authorUrl?: string; content?: string }): string | null {
	if (!body.authorName?.trim() || body.authorName.trim().length > MAX_NAME) return '昵称不能为空且不超过 40 字';
	if (body.authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.authorEmail)) return '邮箱格式不正确';
	if (body.authorUrl && !/^https?:\/\//.test(body.authorUrl)) return '主页链接必须以 http(s) 开头';
	if (!body.content?.trim()) return '评论内容不能为空';
	if (body.content.length > MAX_CONTENT) return `评论不能超过 ${MAX_CONTENT} 字`;
	if (/<(script|iframe|style)/i.test(body.content)) return '评论内容包含不允许的标签';
	return null;
}

export const GET: APIRoute = async ({ params, locals }) => {
	const { slug } = params;
	if (!slug) return Response.json({ error: 'missing slug' }, { status: 400 });

	const db = getDb({ locals });
	const postId = await getPostIdBySlug(db, slug);
	if (!postId) return Response.json({ error: 'post not found' }, { status: 404 });

	const items = await listApprovedComments(db, postId);
	return Response.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
	const { slug } = params;
	if (!slug) return Response.json({ error: 'missing slug' }, { status: 400 });

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: '请求体格式错误' }, { status: 400 });
	}

	const error = validate(body as Parameters<typeof validate>[0]);
	if (error) return Response.json({ error }, { status: 400 });

	const db = getDb({ locals });
	const postId = await getPostIdBySlug(db, slug);
	if (!postId) return Response.json({ error: 'post not found' }, { status: 404 });

	const visitor = await visitorHash(request);
	const allowed = await rateLimit({ locals }, `comment:${visitor}`, 3, 60_000);
	if (!allowed) return Response.json({ error: '评论太频繁，请稍后再试' }, { status: 429 });

	const ip = await ipHash(request);
	const id = await createComment(db, postId, {
		parentId: typeof body.parentId === 'number' && body.parentId > 0 ? body.parentId : null,
		authorName: String(body.authorName).trim().slice(0, MAX_NAME),
		authorEmail: body.authorEmail ? String(body.authorEmail).trim() : undefined,
		authorUrl: body.authorUrl ? String(body.authorUrl).trim() : undefined,
		content: String(body.content).trim().slice(0, MAX_CONTENT),
		ipHash: ip,
	});

	const items = await listApprovedComments(db, postId);
	return Response.json({ ok: true, id, items }, { status: 201 });
};
