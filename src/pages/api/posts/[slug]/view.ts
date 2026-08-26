import type { APIRoute } from 'astro';
import { getDb } from '../../../../lib/db';
import { getPostIdBySlug, recordView, getTotalViews } from '../../../../lib/interactions';
import { visitorHash } from '../../../../lib/visitor';
import { rateLimit } from '../../../../lib/rate-limit';

export const prerender = false;

/** 浏览计数：同一访客对同一文章 10 分钟内只计一次 */
export const POST: APIRoute = async ({ params, request, locals }) => {
	const { slug } = params;
	if (!slug) return Response.json({ error: 'missing slug' }, { status: 400 });

	const db = getDb({ locals });
	const postId = await getPostIdBySlug(db, slug);
	if (!postId) return Response.json({ error: 'post not found' }, { status: 404 });

	const visitor = await visitorHash(request);
	const counted = await rateLimit({ locals }, `view:${postId}:${visitor}`, 1, 600_000);
	if (counted) {
		await recordView(db, postId);
	}
	const total = await getTotalViews(db, postId);
	return Response.json({ total });
};
