import { and, desc, eq, gt, isNull, lt, ne, sql } from 'drizzle-orm';
import { posts, postTags, tags } from '../db/schema';
import type { Db } from './db';

/** 标签分隔符（ASCII unit separator，标签名中不会出现；作为 SQL 参数传入避免模板转义问题） */
const TAG_SEP = '\x1f';

export interface PostListItem {
	id: number;
	slug: string;
	title: string;
	description: string;
	heroImage: string | null;
	publishedAt: Date;
	readingMinutes: number;
	tags: string[];
}

export interface PostDetail extends PostListItem {
	contentHtml: string;
	contentMd: string;
	updatedAt: Date | null;
}

/** 已发布文章列表（含标签），按发布时间倒序 */
export async function listPosts(db: Db): Promise<PostListItem[]> {
	const rows = await db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			description: posts.description,
			heroImage: posts.heroImage,
			publishedAt: posts.publishedAt,
			readingMinutes: posts.readingMinutes,
			tags: sql<string>`(
				select group_concat(t.name, ${TAG_SEP})
				from post_tags pt join tags t on t.id = pt.tag_id
				where pt.post_id = ${posts.id}
			)`,
		})
		.from(posts)
		.where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
		.orderBy(desc(posts.publishedAt));

	return rows.map((r) => ({
		...r,
		tags: r.tags ? r.tags.split(TAG_SEP) : [],
	}));
}

/** 单篇文章详情（含标签） */
export async function getPostBySlug(db: Db, slug: string): Promise<PostDetail | null> {
	const rows = await db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			description: posts.description,
			contentHtml: posts.contentHtml,
			contentMd: posts.contentMd,
			heroImage: posts.heroImage,
			publishedAt: posts.publishedAt,
			updatedAt: posts.updatedAt,
			readingMinutes: posts.readingMinutes,
			tags: sql<string>`(
				select group_concat(t.name, ${TAG_SEP})
				from post_tags pt join tags t on t.id = pt.tag_id
				where pt.post_id = ${posts.id}
			)`,
		})
		.from(posts)
		.where(and(eq(posts.slug, slug), eq(posts.status, 'published'), isNull(posts.deletedAt)))
		.limit(1);

	const row = rows[0];
	if (!row) return null;
	return { ...row, tags: row.tags ? row.tags.split('\x1f') : [] };
}

/** 上一篇（更早）/ 下一篇（更新） */
export async function getNeighbors(
	db: Db,
	publishedAt: Date,
): Promise<{ prev: { title: string; href: string } | undefined; next: { title: string; href: string } | undefined }> {
	const [older] = await db
		.select({ title: posts.title, slug: posts.slug })
		.from(posts)
		.where(
			and(
				eq(posts.status, 'published'),
				isNull(posts.deletedAt),
				lt(posts.publishedAt, publishedAt),
			),
		)
		.orderBy(desc(posts.publishedAt))
		.limit(1);

	const [newer] = await db
		.select({ title: posts.title, slug: posts.slug })
		.from(posts)
		.where(
			and(
				eq(posts.status, 'published'),
				isNull(posts.deletedAt),
				gt(posts.publishedAt, publishedAt),
			),
		)
		.orderBy(posts.publishedAt)
		.limit(1);

	return {
		prev: older ? { title: older.title, href: `/blog/${older.slug}/` } : undefined,
		next: newer ? { title: newer.title, href: `/blog/${newer.slug}/` } : undefined,
	};
}

/** 相关文章：按共享标签数排序，同分取更新 */
export async function getRelated(
	db: Db,
	postId: number,
	postTags_: string[],
	limit = 3,
): Promise<{ title: string; href: string; readingMinutes: number }[]> {
	if (!postTags_.length) return [];
	const scoreExpr = sql<number>`(
		select count(*)
		from post_tags pt join tags t on t.id = pt.tag_id
		where pt.post_id = ${posts.id} and t.name in (${sql.join(
			postTags_.map((t) => sql`${t}`),
			sql`, `,
		)})
	)`;
	const rows = await db
		.select({
			title: posts.title,
			slug: posts.slug,
			readingMinutes: posts.readingMinutes,
			score: scoreExpr,
		})
		.from(posts)
		.where(
			and(
				eq(posts.status, 'published'),
				isNull(posts.deletedAt),
				ne(posts.id, postId),
				sql`(${scoreExpr}) > 0`,
			),
		)
		.orderBy(desc(scoreExpr), desc(posts.publishedAt))
		.limit(limit);

	return rows.map((r) => ({
		title: r.title,
		href: `/blog/${r.slug}/`,
		readingMinutes: r.readingMinutes,
	}));
}

/** 标签 → 计数（仅统计已发布未删除文章） */
export async function listTagCounts(db: Db): Promise<{ name: string; count: number }[]> {
	// 注意:drizzle 模板列引用会生成无表限定的 "id"，在子查询里被 SQLite 解析为内层表列，
	// 因此这里手写全限定列名
	const rows = await db.all<{ name: string; count: number }>(sql`
		select t.name as name, (
			select count(*)
			from post_tags pt join posts p on p.id = pt.post_id
			where pt.tag_id = t.id and p.status = 'published' and p.deleted_at is null
		) as count
		from tags t
	`);

	return rows
		.map((r) => ({ name: r.name, count: Number(r.count) }))
		.filter((r) => r.count > 0)
		.sort((a, b) => b.count - a.count);
}

/** 指定标签下的文章列表 */
export async function listPostsByTag(db: Db, tagName: string): Promise<PostListItem[]> {
	const all = await listPosts(db);
	return all.filter((p) => p.tags.includes(tagName));
}

/** 搜索索引文档（含正文纯文本与标签） */
export async function listSearchDocs(
	db: Db,
): Promise<{ slug: string; title: string; description: string; contentMd: string; publishedAt: Date; tags: string[] }[]> {
	const rows = await db
		.select({
			slug: posts.slug,
			title: posts.title,
			description: posts.description,
			contentMd: posts.contentMd,
			publishedAt: posts.publishedAt,
			tags: sql<string>`(
				select group_concat(t.name, ${TAG_SEP})
				from post_tags pt join tags t on t.id = pt.tag_id
				where pt.post_id = ${posts.id}
			)`,
		})
		.from(posts)
		.where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
		.orderBy(desc(posts.publishedAt));

	return rows.map((r) => ({ ...r, tags: r.tags ? r.tags.split(TAG_SEP) : [] }));
}
