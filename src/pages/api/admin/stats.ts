import type { APIRoute } from 'astro';
import { and, eq, gte, isNull, sql, desc } from 'drizzle-orm';
import { getDb } from '../../../lib/db';
import { posts, comments, reactions, viewStats } from '../../../db/schema';
import { requireAdmin } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
	const guard = await requireAdmin(locals.runtime.env, request);
	if ('response' in guard) return guard.response;

	const db = getDb({ locals });

	const [postCount] = await db
		.select({
			total: sql<number>`count(*)`,
			published: sql<number>`sum(case when status = 'published' then 1 else 0 end)`,
		})
		.from(posts)
		.where(isNull(posts.deletedAt));

	// 评论/点赞/浏览只统计未删除文章（软删文章的关联数据在删除时已清理，这里再兜底过滤）
	const [commentCount] = await db
		.select({
			total: sql<number>`count(*)`,
			pending: sql<number>`sum(case when ${comments.status} = 'pending' then 1 else 0 end)`,
		})
		.from(comments)
		.innerJoin(posts, eq(posts.id, comments.postId))
		.where(isNull(posts.deletedAt));

	const [likeCount] = await db
		.select({ total: sql<number>`count(*)` })
		.from(reactions)
		.innerJoin(posts, eq(posts.id, reactions.postId))
		.where(isNull(posts.deletedAt));

	const [viewCount] = await db
		.select({ total: sql<number>`coalesce(sum(${viewStats.count}), 0)` })
		.from(viewStats)
		.innerJoin(posts, eq(posts.id, viewStats.postId))
		.where(isNull(posts.deletedAt));

	// 近 14 天浏览趋势
	const since = new Date(Date.now() - 14 * 86400_000).toISOString().slice(0, 10);
	const trend = await db
		.select({ date: viewStats.date, count: sql<number>`sum(${viewStats.count})` })
		.from(viewStats)
		.innerJoin(posts, eq(posts.id, viewStats.postId))
		.where(and(isNull(posts.deletedAt), gte(viewStats.date, since)))
		.groupBy(viewStats.date)
		.orderBy(viewStats.date);

	// 热门文章（按浏览量）
	const hot = await db
		.select({
			slug: posts.slug,
			title: posts.title,
			views: sql<number>`coalesce(sum(${viewStats.count}), 0)`,
			likes: sql<number>`(select count(*) from reactions r where r.post_id = ${posts.id})`,
		})
		.from(posts)
		.leftJoin(viewStats, eq(viewStats.postId, posts.id))
		.where(and(isNull(posts.deletedAt), eq(posts.status, 'published')))
		.groupBy(posts.id)
		.orderBy(desc(sql`coalesce(sum(${viewStats.count}), 0)`))
		.limit(5);

	return Response.json({
		posts: { total: Number(postCount?.total ?? 0), published: Number(postCount?.published ?? 0) },
		comments: { total: Number(commentCount?.total ?? 0), pending: Number(commentCount?.pending ?? 0) },
		likes: Number(likeCount?.total ?? 0),
		views: Number(viewCount?.total ?? 0),
		trend: trend.map((t) => ({ date: t.date, count: Number(t.count) })),
		hot: hot.map((h) => ({ ...h, views: Number(h.views), likes: Number(h.likes) })),
	});
};
