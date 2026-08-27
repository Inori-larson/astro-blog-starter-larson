import type { APIRoute } from 'astro';
import { sql } from 'drizzle-orm';
import { getDb } from '../../../lib/db';
import { settings } from '../../../db/schema';
import { requireAdmin } from '../../../lib/auth';
import { invalidateCache } from '../../../lib/cache';
import { getSiteSettings, normalizeSiteSettings, serializeSettings } from '../../../lib/settings';

export const prerender = false;

/** 读取站点文案（管理端编辑表单回显） */
export const GET: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const db = getDb({ locals });
	const data = await getSiteSettings({ locals }, db);
	return Response.json(data);
};

/** 保存站点文案（批量 upsert + 缓存失效） */
export const PUT: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: '请求体格式错误' }, { status: 400 });
	}

	const result = normalizeSiteSettings(body);
	if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

	const db = getDb({ locals });
	const rows = serializeSettings(result.value);
	await db
		.insert(settings)
		.values(rows)
		.onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });

	await invalidateCache({ locals });
	return Response.json({ ok: true });
};
