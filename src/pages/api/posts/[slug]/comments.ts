import type { APIRoute } from 'astro';
import { getDb } from '../../../../lib/db';
import { createComment, getPostIdBySlug, isValidParentComment, listApprovedComments } from '../../../../lib/interactions';
import { ipHash, visitorHash } from '../../../../lib/visitor';
import { rateLimit } from '../../../../lib/rate-limit';

export const prerender = false;

const MAX_CONTENT = 2000;
const MAX_NAME = 40;
const MAX_EMAIL = 200;
const MAX_URL = 500;

/** 评论校验：格式 + 长度 */
function validate(body: { authorName?: string; authorEmail?: string; authorUrl?: string; content?: string }): string | null {
	if (!body.authorName?.trim() || body.authorName.trim().length > MAX_NAME) return `昵称不能为空且不超过 ${MAX_NAME} 字`;
	if (body.authorEmail && body.authorEmail.length > MAX_EMAIL) return `邮箱不能超过 ${MAX_EMAIL} 字`;
	if (body.authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.authorEmail)) return '邮箱格式不正确';
	if (body.authorUrl && body.authorUrl.length > MAX_URL) return `主页链接不能超过 ${MAX_URL} 字`;
	if (body.authorUrl && !/^https?:\/\//.test(body.authorUrl)) return '主页链接必须以 http(s) 开头';
	if (!body.content?.trim()) return '评论内容不能为空';
	if (body.content.length > MAX_CONTENT) return `评论不能超过 ${MAX_CONTENT} 字`;
	if (/<(script|iframe|style)/i.test(body.content)) return '评论内容包含不允许的标签';
	return null;
}

export const GET: APIRoute = async ({ params, locals }) => {
	const { slug } = params;
	if (!slug || !/^[a-z0-9-]+$/.test(slug)) return Response.json({ error: 'invalid slug' }, { status: 400 });

	const db = getDb({ locals });
	const postId = await getPostIdBySlug(db, slug);
	if (!postId) return Response.json({ error: 'post not found' }, { status: 404 });

	const items = await listApprovedComments(db, postId);
	return Response.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
	const { slug } = params;
	if (!slug || !/^[a-z0-9-]+$/.test(slug)) return Response.json({ error: 'invalid slug' }, { status: 400 });

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

	// 限流：访客指纹 + 纯 IP 双键（UA 可伪造，IP 轮换成本高得多）
	const visitor = await visitorHash(request);
	const allowedVisitor = await rateLimit({ locals }, `comment:${visitor}`, 3, 60_000);
	const ip = await ipHash(request);
	const allowedIp = await rateLimit({ locals }, `comment-ip:${ip}`, 5, 60_000);
	if (!allowedVisitor || !allowedIp) return Response.json({ error: '评论太频繁，请稍后再试' }, { status: 429 });

	// 父评论校验：必须存在、同文章、已通过审核
	let parentId: number | null = null;
	if (typeof body.parentId === 'number' && Number.isInteger(body.parentId) && body.parentId > 0) {
		const ok = await isValidParentComment(db, postId, body.parentId);
		if (!ok) return Response.json({ error: '回复的评论不存在或未通过审核' }, { status: 400 });
		parentId = body.parentId;
	}

	const id = await createComment(db, postId, {
		parentId,
		authorName: String(body.authorName).trim().slice(0, MAX_NAME),
		authorEmail: body.authorEmail ? String(body.authorEmail).trim().slice(0, MAX_EMAIL) : undefined,
		authorUrl: body.authorUrl ? String(body.authorUrl).trim().slice(0, MAX_URL) : undefined,
		content: String(body.content).trim().slice(0, MAX_CONTENT),
		ipHash: ip,
	});

	// 新评论待审核，返回当前已通过列表（不含新评论）
	const items = await listApprovedComments(db, postId);
	return Response.json({ ok: true, id, pending: true, items }, { status: 201 });
};
