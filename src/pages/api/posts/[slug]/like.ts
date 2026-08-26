import type { APIRoute } from 'astro';
import { getDb } from '../../../../lib/db';
import { getPostIdBySlug, getLikeState, toggleLike } from '../../../../lib/interactions';
import { visitorHash } from '../../../../lib/visitor';
import { rateLimit } from '../../../../lib/rate-limit';

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
	const { slug } = params;
	if (!slug) return Response.json({ error: 'missing slug' }, { status: 400 });

	const db = getDb({ locals });
	const postId = await getPostIdBySlug(db, slug);
	if (!postId) return Response.json({ error: 'post not found' }, { status: 404 });

	const visitor = await visitorHash(request);
	const allowed = await rateLimit({ locals }, `like:${visitor}`, 10, 60_000);
	if (!allowed) return Response.json({ error: '操作太频繁，请稍后再试' }, { status: 429 });

	const state = await toggleLike(db, postId, visitor);
	return Response.json(state);
};

export const GET: APIRoute = async ({ params, request, locals }) => {
	const { slug } = params;
	if (!slug) return Response.json({ error: 'missing slug' }, { status: 400 });

	const db = getDb({ locals });
	const postId = await getPostIdBySlug(db, slug);
	if (!postId) return Response.json({ error: 'post not found' }, { status: 404 });

	const visitor = await visitorHash(request);
	const state = await getLikeState(db, postId, visitor);
	return Response.json(state, { headers: { 'Cache-Control': 'no-store' } });
};
