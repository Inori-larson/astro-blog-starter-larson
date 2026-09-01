/**
 * 简单滑动窗口限流：内存（L1）+ KV（L2，跨 isolate）
 * 免费版 KV 写 1k/天，仅低频接口（登录/评论/订阅）启用 KV 兜底；
 * 高频接口（view）只走内存，牺牲跨 isolate 精度换取额度
 */

const memBuckets = new Map<string, number[]>();
/** 内存桶上限：超限淘汰最旧键，防爬虫轮换 UA 制造无限键 */
const MEM_MAX_BUCKETS = 1000;

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

function memSet(key: string, bucket: number[]) {
	if (memBuckets.size >= MEM_MAX_BUCKETS && !memBuckets.has(key)) {
		// 简单淘汰：删最早插入的键
		const first = memBuckets.keys().next().value;
		if (first !== undefined) memBuckets.delete(first);
	}
	memBuckets.set(key, bucket);
}

/**
 * 检查并消费一次配额
 * @param opts.kv 是否启用 KV 跨 isolate 兜底（默认 true；高频接口传 false）
 * @returns true = 放行；false = 超限
 */
export async function rateLimit(
	ctx: RateLimitContext,
	key: string,
	limit: number,
	windowMs: number,
	opts: { kv?: boolean } = {},
): Promise<boolean> {
	const useKv = opts.kv !== false;
	const now = Date.now();
	const bucket = (memBuckets.get(key) ?? []).filter((t) => now - t < windowMs);

	if (bucket.length >= limit) {
		memSet(key, bucket);
		return false;
	}

	const kv = useKv ? await getKv(ctx) : undefined;
	if (kv && bucket.length === 0) {
		try {
			const raw = await kv.get(`rl:${key}`, 'json');
			if (Array.isArray(raw)) {
				const kvBucket = (raw as number[]).filter((t) => now - t < windowMs);
				if (kvBucket.length >= limit) {
					memSet(key, kvBucket);
					return false;
				}
				bucket.push(...kvBucket.slice(0, limit - 1 - bucket.length));
			}
		} catch {
			// KV 不可用不影响限流主流程
		}
	}

	bucket.push(now);
	memSet(key, bucket);

	if (kv && bucket.length <= 2) {
		// 每窗口前几次写 KV，避免超配额
		try {
			await kv.put(`rl:${key}`, JSON.stringify(bucket), { expirationTtl: Math.ceil(windowMs / 1000) });
		} catch {
			// 忽略写失败
		}
	}
	return true;
}
