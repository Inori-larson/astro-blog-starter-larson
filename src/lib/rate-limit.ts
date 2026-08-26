/**
 * 简单滑动窗口限流：内存（L1）+ KV（L2，跨 isolate）
 * 免费版 KV 写 1k/天，仅在内存未命中时同步一次 KV 计数
 */

const memBuckets = new Map<string, number[]>();

interface RateLimitContext {
	locals: App.Locals;
}

async function getKv(ctx: RateLimitContext) {
	try {
		return ctx.locals.runtime.env.CACHE;
	} catch {
		return undefined;
	}
}

/**
 * 检查并消费一次配额
 * @returns true = 放行；false = 超限
 */
export async function rateLimit(ctx: RateLimitContext, key: string, limit: number, windowMs: number): Promise<boolean> {
	const now = Date.now();
	const bucket = (memBuckets.get(key) ?? []).filter((t) => now - t < windowMs);

	if (bucket.length >= limit) {
		memBuckets.set(key, bucket);
		return false;
	}

	// KV 层（内存刚重启/换 isolate 时兜底）；失败不阻塞
	const kv = await getKv(ctx);
	if (kv && bucket.length === 0) {
		try {
			const raw = await kv.get(`rl:${key}`, 'json');
			if (Array.isArray(raw)) {
				const kvBucket = (raw as number[]).filter((t) => now - t < windowMs);
				if (kvBucket.length >= limit) {
					memBuckets.set(key, kvBucket);
					return false;
				}
				bucket.push(...kvBucket.slice(0, limit - 1 - bucket.length));
			}
		} catch {
			// 忽略
		}
	}

	bucket.push(now);
	memBuckets.set(key, bucket);

	if (kv && bucket.length <= 2) {
		// 每窗口前几次写 KV，避免超配额
		try {
			await kv.put(`rl:${key}`, JSON.stringify(bucket), { expirationTtl: Math.ceil(windowMs / 1000) });
		} catch {
			// 忽略
		}
	}
	return true;
}
