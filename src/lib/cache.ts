/**
 * 两级缓存：进程内存（L1）+ Workers KV（L2，跨 isolate 共享）
 * - 读：内存 → KV → 回源执行 fn
 * - 写：仅回源时写 KV（免费版 1k 写/天，个人博客足够）
 * - 后台发布文章后调用 invalidateCache() 主动失效
 */

const mem = new Map<string, { value: unknown; expires: number }>();
const MEM_MAX = 200;

/** 已知日期字段：JSON 往返后还原为 Date 对象 */
const DATE_KEYS = new Set(['publishedAt', 'updatedAt', 'createdAt', 'date']);
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function revive(_key: string, value: unknown): unknown {
	if (typeof value === 'string' && DATE_KEYS.has(_key) && ISO_PATTERN.test(value)) {
		return new Date(value);
	}
	return value;
}

function memGet<T>(key: string): T | undefined {
	const hit = mem.get(key);
	if (!hit) return undefined;
	if (hit.expires < Date.now()) {
		mem.delete(key);
		return undefined;
	}
	return hit.value as T;
}

function memSet(key: string, value: unknown, ttlMs: number) {
	if (mem.size >= MEM_MAX) {
		// 简单淘汰：删最早插入的键
		const first = mem.keys().next().value;
		if (first !== undefined) mem.delete(first);
	}
	mem.set(key, { value, expires: Date.now() + ttlMs });
}

interface CacheContext {
	locals: App.Locals;
}

async function getKv(ctx: CacheContext) {
	try {
		return ctx.locals.runtime.env.CACHE;
	} catch {
		return undefined;
	}
}

export async function cached<T>(ctx: CacheContext, key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
	// L1 内存
	const memHit = memGet<T>(key);
	if (memHit !== undefined) return memHit;

	// L2 KV（以纯文本读取后用 reviver 还原日期字段）
	const kv = await getKv(ctx);
	let kvHit: T | undefined;
	if (kv) {
		try {
			const raw = await kv.get(`c:${key}`, 'text');
			if (raw !== null) {
				kvHit = JSON.parse(raw, revive) as T;
				memSet(key, kvHit, ttlSeconds * 1000);
				return kvHit;
			}
		} catch {
			// KV 不可用不影响主流程
		}
	}

	// 回源
	const value = await fn();
	memSet(key, value, ttlSeconds * 1000);
	if (kv) {
		try {
			await kv.put(`c:${key}`, JSON.stringify(value), { expirationTtl: Math.max(ttlSeconds, 60) });
		} catch {
			// 忽略写失败
		}
	}
	return value;
}

/** 主动失效：清内存 + 删 KV 指定前缀的键（后台发布/编辑时调用） */
export async function invalidateCache(ctx: CacheContext, prefix = '') {
	for (const key of [...mem.keys()]) {
		if (key.startsWith(prefix)) mem.delete(key);
	}
	const kv = await getKv(ctx);
	if (!kv) return;
	try {
		const list = await kv.list({ prefix: `c:${prefix}` });
		const keys: string[] = [];
		for (const key of list.keys ?? []) keys.push(key.name);
		if (keys.length) await Promise.all(keys.map((k) => kv.delete(k)));
	} catch {
		// 忽略
	}
}
