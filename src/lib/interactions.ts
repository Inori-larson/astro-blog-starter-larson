import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { comments, posts, reactions, viewStats } from '../db/schema';
import type { Db } from './db';

export interface CommentItem {
	id: number;
	parentId: number | null;
	authorName: string;
	authorUrl: string | null;
	content: string;
	createdAt: Date;
}

/** 已通过审核的评论列表（含楼中楼结构） */
export async function listApprovedComments(db: Db, postId: number): Promise<CommentItem[]> {
	const rows = await db
		.select({
			id: comments.id,
			parentId: comments.parentId,
			authorName: comments.authorName,
			authorUrl: comments.authorUrl,
			content: comments.content,
			createdAt: comments.createdAt,
		})
		.from(comments)
		.where(and(eq(comments.postId, postId), eq(comments.status, 'approved')))
		.orderBy(comments.createdAt);
	return rows;
}

/** 新增评论（待审核，后台通过后前台可见） */
export async function createComment(
	db: Db,
	postId: number,
	data: { parentId: number | null; authorName: string; authorEmail?: string; authorUrl?: string; content: string; ipHash: string },
): Promise<number> {
	const [row] = await db
		.insert(comments)
		.values({
			postId,
			parentId: data.parentId,
			authorName: data.authorName,
			authorEmail: data.authorEmail ?? null,
			authorUrl: data.authorUrl ?? null,
			content: data.content,
			status: 'pending',
			ipHash: data.ipHash,
		})
		.returning({ id: comments.id });
	return row.id;
}

/** 校验父评论：存在、同文章、已通过审核（防跨文章挂载与孤儿楼中楼） */
export async function isValidParentComment(db: Db, postId: number, parentId: number): Promise<boolean> {
	const [row] = await db
		.select({ id: comments.id })
		.from(comments)
		.where(and(eq(comments.id, parentId), eq(comments.postId, postId), eq(comments.status, 'approved')))
		.limit(1);
	return !!row;
}

/** 点赞数 / 当前访客是否已点赞 */
export async function getLikeState(db: Db, postId: number, visitor: string): Promise<{ count: number; liked: boolean }> {
	const [countRow] = await db
		.select({ count: sql<number>`count(*)` })
		.from(reactions)
		.where(eq(reactions.postId, postId));
	const likedRow = await db
		.select({ visitorHash: reactions.visitorHash })
		.from(reactions)
		.where(and(eq(reactions.postId, postId), eq(reactions.visitorHash, visitor)))
		.limit(1);
	return {
		count: Number(countRow?.count ?? 0),
		liked: likedRow.length > 0,
	};
}

/** 切换点赞（已赞则取消），返回新状态 */
export async function toggleLike(db: Db, postId: number, visitor: string): Promise<{ count: number; liked: boolean }> {
	const liked = await db
		.select({ visitorHash: reactions.visitorHash })
		.from(reactions)
		.where(and(eq(reactions.postId, postId), eq(reactions.visitorHash, visitor)))
		.limit(1);

	if (liked.length > 0) {
		await db.delete(reactions).where(and(eq(reactions.postId, postId), eq(reactions.visitorHash, visitor)));
	} else {
		await db.insert(reactions).values({ postId, visitorHash: visitor });
	}
	return getLikeState(db, postId, visitor);
}

/** 文章总浏览量 */
export async function getTotalViews(db: Db, postId: number): Promise<number> {
	const [row] = await db
		.select({ total: sql<number>`coalesce(sum(${viewStats.count}), 0)` })
		.from(viewStats)
		.where(eq(viewStats.postId, postId));
	return Number(row?.total ?? 0);
}

/** 浏览计数：按天 UPSERT */
export async function recordView(db: Db, postId: number): Promise<void> {
	const today = new Date().toISOString().slice(0, 10);
	await db.run(sql`
		insert into view_stats (post_id, date, count) values (${postId}, ${today}, 1)
		on conflict (post_id, date) do update set count = count + 1
	`);
}

/** 通过 slug 查文章 id（供 API 端点用） */
export async function getPostIdBySlug(db: Db, slug: string): Promise<number | null> {
	const [row] = await db
		.select({ id: posts.id })
		.from(posts)
		.where(and(eq(posts.slug, slug), eq(posts.status, 'published'), isNull(posts.deletedAt)))
		.limit(1);
	return row?.id ?? null;
}
