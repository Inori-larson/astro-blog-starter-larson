import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb } from '../../../lib/db';
import { subscribers } from '../../../db/schema';

export const prerender = false;

/** 验证订阅（邮件链接跳转）：GET /api/subscribe/verify?token=xxx */
export const GET: APIRoute = async ({ url, locals }) => {
	const token = url.searchParams.get('token');
	if (!token || !/^[a-f0-9]{48}$/.test(token)) {
		return Response.redirect(new URL('/subscribe/verify?state=invalid', url.origin), 302);
	}

	const db = getDb({ locals });
	const [row] = await db
		.select({ id: subscribers.id, verified: subscribers.verified })
		.from(subscribers)
		.where(eq(subscribers.token, token))
		.limit(1);

	if (!row) {
		return new Response(null, {
			status: 302,
			headers: { Location: new URL('/subscribe/verify?state=invalid', url.origin).toString() },
		});
	}

	if (!row.verified) {
		await db.update(subscribers).set({ verified: true }).where(eq(subscribers.id, row.id));
	}

	return new Response(null, {
		status: 302,
		headers: { Location: new URL('/subscribe/verify?state=ok', url.origin).toString() },
	});
};

/** 退订：GET /api/subscribe/verify?token=xxx&unsubscribe=1 */
export const POST: APIRoute = async ({ url, locals }) => {
	const token = url.searchParams.get('token');
	const unsubscribe = url.searchParams.get('unsubscribe');
	if (!token || !unsubscribe) return Response.json({ error: '参数错误' }, { status: 400 });

	const db = getDb({ locals });
	const [row] = await db
		.select({ id: subscribers.id })
		.from(subscribers)
		.where(eq(subscribers.token, token))
		.limit(1);
	if (!row) return Response.json({ error: '链接无效' }, { status: 404 });

	await db.delete(subscribers).where(eq(subscribers.id, row.id));
	return Response.json({ ok: true });
};
