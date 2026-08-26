import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb } from '../../../lib/db';
import { subscribers } from '../../../db/schema';
import { sendSubscribeConfirm } from '../../../lib/mail';
import { rateLimit } from '../../../lib/rate-limit';
import { visitorHash } from '../../../lib/visitor';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, locals }) => {
	let body: { email?: string };
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: '请求体格式错误' }, { status: 400 });
	}

	const email = body.email?.trim().toLowerCase();
	if (!email || !EMAIL_RE.test(email) || email.length > 200) {
		return Response.json({ error: '邮箱格式不正确' }, { status: 400 });
	}

	const visitor = await visitorHash(request);
	const allowed = await rateLimit({ locals }, `subscribe:${visitor}`, 3, 600_000);
	if (!allowed) return Response.json({ error: '操作太频繁，请稍后再试' }, { status: 429 });

	const db = getDb({ locals });
	const [existing] = await db
		.select({ id: subscribers.id, verified: subscribers.verified })
		.from(subscribers)
		.where(eq(subscribers.email, email))
		.limit(1);

	// 生成验证 token（48 位随机）
	const token = [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, '0')).join('');

	if (existing) {
		if (existing.verified) {
			return Response.json({ ok: true, message: '已订阅过啦，无需重复操作' });
		}
		// 重新发送验证邮件
		await db.update(subscribers).set({ token }).where(eq(subscribers.id, existing.id));
	} else {
		await db.insert(subscribers).values({ email, token, verified: false });
	}

	const result = await sendSubscribeConfirm(locals.runtime.env as { RESEND_API_KEY?: string; MAIL_FROM?: string }, email, token);
	// 开发环境（未配置 key）也返回成功，方便前端联调
	return Response.json({
		ok: true,
		message: result.ok ? '验证邮件已发送，请到邮箱确认（24 小时内有效）' : '订阅已记录，邮件服务暂未配置',
	});
};
