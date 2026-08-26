/**
 * 认证：PBKDF2 密码哈希 + JWT 会话（httpOnly Cookie）
 * 单管理员场景，密钥来自环境变量 AUTH_SECRET（.dev.vars / Cloudflare secrets）
 */
import { SignJWT, jwtVerify } from 'jose';

const PBKDF2_ITERATIONS = 100_000;
const COOKIE_NAME = 'admin_session';
const SESSION_TTL_SECONDS = 7 * 24 * 3600;

// ---------- 密码哈希（WebCrypto PBKDF2，Workers 原生支持） ----------

function toHex(buf: ArrayBuffer): string {
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
	const out = new Uint8Array(new ArrayBuffer(hex.length / 2));
	for (let i = 0; i < out.length; i++) {
		out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return out;
}

/** 生成密码哈希：pbkdf2$iterations$salt_hex$hash_hex */
export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
		'deriveBits',
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
		key,
		256,
	);
	return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt.buffer as ArrayBuffer)}$${toHex(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const parts = stored.split('$');
	if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
	const iterations = Number(parts[1]);
	const salt = fromHex(parts[2]!);
	const expected = parts[3]!;
	const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
		'deriveBits',
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
		key,
		256,
	);
	// 常量时间比较
	const actual = toHex(bits);
	if (actual.length !== expected.length) return false;
	let diff = 0;
	for (let i = 0; i < actual.length; i++) {
		diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
	}
	return diff === 0;
}

// ---------- JWT 会话 ----------

function getSecret(env: { AUTH_SECRET?: string }): Uint8Array<ArrayBuffer> {
	const secret = env.AUTH_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error('AUTH_SECRET 未配置或长度不足 32 字符');
	}
	const bytes = new TextEncoder().encode(secret);
	const out = new Uint8Array(new ArrayBuffer(bytes.byteLength));
	out.set(bytes);
	return out;
}

export interface SessionPayload {
	uid: number;
	email: string;
	name: string;
}

export async function createSession(env: { AUTH_SECRET?: string }, payload: SessionPayload): Promise<string> {
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(`${SESSION_TTL_SECONDS}s`)
		.sign(getSecret(env));
}

export async function readSession(env: { AUTH_SECRET?: string }, token: string | undefined): Promise<SessionPayload | null> {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, getSecret(env));
		if (typeof payload.uid !== 'number' || typeof payload.email !== 'string') return null;
		return { uid: payload.uid, email: payload.email, name: String(payload.name ?? '') };
	} catch {
		return null;
	}
}

/** 从请求读取会话（Cookie） */
export async function getSessionFromRequest(env: { AUTH_SECRET?: string }, request: Request): Promise<SessionPayload | null> {
	const cookie = request.headers.get('cookie') ?? '';
	const token = cookie
		.split(';')
		.map((c) => c.trim())
		.find((c) => c.startsWith(`${COOKIE_NAME}=`))
		?.slice(COOKIE_NAME.length + 1);
	return readSession(env, token);
}

export function sessionCookie(token: string): string {
	return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}; Secure`;
}

export function clearSessionCookie(): string {
	return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}

/** API 守卫：未登录时返回 401 响应，否则返回 null */
export async function requireAdmin(
	env: unknown,
	request: Request,
): Promise<{ session: SessionPayload } | { response: Response }> {
	const session = await getSessionFromRequest(env as { AUTH_SECRET?: string }, request);
	if (!session) {
		return { response: Response.json({ error: '未登录' }, { status: 401 }) };
	}
	return { session };
}

/**
 * 页面守卫（后台 .astro 页面 frontmatter 中调用）：
 * 未登录返回重定向 Response，页面需 `if (response) return response;`
 */
export async function requireAdminPage(
	env: unknown,
	request: Request,
): Promise<Response | null> {
	const session = await getSessionFromRequest(env as { AUTH_SECRET?: string }, request);
	if (!session) {
		return new Response(null, {
			status: 302,
			headers: { Location: new URL('/admin/login', request.url).toString() },
		});
	}
	return null;
}
