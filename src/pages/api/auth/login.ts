import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { createSession, sessionCookie, verifyPassword } from '../../../lib/auth';
import { rateLimit } from '../../../lib/rate-limit';
import { ipHash } from '../../../lib/visitor';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	const ip = await ipHash(request);
	const allowed = await rateLimit({ locals }, `login:${ip}`, 5, 300_000);
	if (!allowed) return Response.json({ error: '尝试次数过多，请 5 分钟后再试' }, { status: 429 });

	let body: { email?: string; password?: string };
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: '请求体格式错误' }, { status: 400 });
	}
	const email = body.email?.trim().toLowerCase();
	const password = body.password ?? '';
	if (!email || !password) return Response.json({ error: '请输入邮箱和密码' }, { status: 400 });

	const db = getDb({ locals });
	const [user] = await db
		.select({ id: users.id, email: users.email, name: users.name, passwordHash: users.passwordHash })
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (!user || !(await verifyPassword(password, user.passwordHash))) {
		return Response.json({ error: '邮箱或密码不正确' }, { status: 401 });
	}

	const token = await createSession(locals.runtime.env as { AUTH_SECRET?: string }, { uid: user.id, email: user.email, name: user.name });
	return Response.json(
		{ ok: true, user: { name: user.name, email: user.email } },
		{ headers: { 'Set-Cookie': sessionCookie(token) } },
	);
};
