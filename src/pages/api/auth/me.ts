import type { APIRoute } from 'astro';
import { getSessionFromRequest } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
	const session = await getSessionFromRequest(locals.runtime.env as { AUTH_SECRET?: string }, request);
	if (!session) return Response.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
	return Response.json(
		{ user: { name: session.name, email: session.email } },
		{ headers: { 'Cache-Control': 'no-store' } },
	);
};
