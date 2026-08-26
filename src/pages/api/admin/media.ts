import type { APIRoute } from 'astro';
import { desc } from 'drizzle-orm';
import { getDb } from '../../../lib/db';
import { media } from '../../../db/schema';
import { requireAdmin } from '../../../lib/auth';

export const prerender = false;

const MAX_SIZE = 100 * 1024 * 1024; // Workers 请求体上限 100MB
const ALLOWED_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
	'image/avif',
	'video/mp4',
	'video/webm',
	'audio/mpeg',
	'audio/mp4',
];

function r2(env: unknown): R2Bucket | null {
	const bucket = (env as { MEDIA?: R2Bucket }).MEDIA;
	return bucket ?? null;
}

/** 媒体列表（元数据来自 D1） */
export const GET: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	if (!r2(locals.runtime.env)) {
		return Response.json({ items: [], warning: 'R2 未绑定：请先在 Cloudflare 控制台启用 R2 并创建 larson-blog-media 存储桶' });
	}

	const db = getDb({ locals });
	const rows = await db.select().from(media).orderBy(desc(media.createdAt)).limit(200);
	return Response.json({ items: rows });
};

/** 上传（multipart/form-data：file 字段） */
export const POST: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const bucket = r2(locals.runtime.env);
	if (!bucket) {
		return Response.json(
			{ error: 'R2 未绑定：请先在 Cloudflare 控制台启用 R2（免费 10GB），创建名为 larson-blog-media 的存储桶后重新部署' },
			{ status: 503 },
		);
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return Response.json({ error: '请求体格式错误（需要 multipart/form-data）' }, { status: 400 });
	}

	const file = form.get('file');
	if (!(file instanceof File)) return Response.json({ error: '缺少 file 字段' }, { status: 400 });
	if (file.size > MAX_SIZE) return Response.json({ error: '文件超过 100MB 上限' }, { status: 413 });
	if (file.type && !ALLOWED_TYPES.includes(file.type)) {
		return Response.json({ error: `不支持的类型：${file.type}` }, { status: 415 });
	}

	// 生成对象键：日期目录 + 随机前缀 + 安全文件名
	const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(-80) || 'file';
	const rand = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('');
	const date = new Date().toISOString().slice(0, 10);
	const key = `uploads/${date}/${rand}-${safeName}`;

	const buf = await file.arrayBuffer();
	await bucket.put(key, buf, {
		httpMetadata: { contentType: file.type || 'application/octet-stream', cacheControl: 'public, max-age=31536000, immutable' },
	});

	// 元数据入库
	const alt = form.get('alt');
	const db = getDb({ locals });
	const [row] = await db
		.insert(media)
		.values({
			r2Key: key,
			filename: file.name.slice(0, 200),
			mime: file.type || 'application/octet-stream',
			size: file.size,
			alt: typeof alt === 'string' && alt.trim() ? alt.trim().slice(0, 200) : null,
			uploaderId: guard.session.uid,
		})
		.returning();

	return Response.json({ ok: true, item: row, url: `/media/${key}` }, { status: 201 });
};

/** 删除（DELETE /api/admin/media?key=uploads/...） */
export const DELETE: APIRoute = async ({ url, request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const bucket = r2(locals.runtime.env);
	if (!bucket) return Response.json({ error: 'R2 未绑定' }, { status: 503 });

	const key = url.searchParams.get('key');
	if (!key || !key.startsWith('uploads/')) return Response.json({ error: '无效 key' }, { status: 400 });

	await bucket.delete(key);
	const db = getDb({ locals });
	const { eq } = await import('drizzle-orm');
	await db.delete(media).where(eq(media.r2Key, key));
	return Response.json({ ok: true });
};
