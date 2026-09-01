import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * 媒体文件服务路由：/media/uploads/2026/08/26/xxxx-file.png → R2 对象
 * 走 Worker 而非 R2 公开域：免费、可控、带长缓存
 */
export const GET: APIRoute = async ({ params, locals }) => {
	const key = params.path;
	if (!key || !/^uploads\/[\w./-]+$/.test(key)) {
		return new Response('Not Found', { status: 404 });
	}

	const bucket = (locals.runtime.env as { MEDIA?: R2Bucket }).MEDIA;
	if (!bucket) return new Response('Media storage unavailable', { status: 503 });

	const obj = await bucket.get(key);
	if (!obj) return new Response('Not Found', { status: 404 });

	const headers = new Headers();
	obj.writeHttpMetadata(headers);
	headers.set('etag', obj.httpEtag);
	headers.set('cache-control', 'public, max-age=31536000, immutable');
	const contentType = headers.get('content-type') ?? 'application/octet-stream';
	if (!headers.has('content-type')) headers.set('content-type', contentType);
	// SVG 可内嵌脚本：强制下载 + 沙箱 CSP，防同源 XSS
	if (contentType.includes('image/svg+xml')) {
		headers.set('content-disposition', 'attachment');
		headers.set('content-security-policy', 'sandbox');
	}

	return new Response(obj.body, { headers });
};
