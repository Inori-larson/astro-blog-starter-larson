import { and, desc, eq, gt, isNull, lt, ne, sql } from 'drizzle-orm';
import { posts, postTags, tags } from '../db/schema';
import type { Db } from './db';

/** 标签分隔符（ASCII unit separator，标签名中不会出现；作为 SQL 参数传入避免模板转义问题） */
// 用 String.fromCharCode 而非 '\x1f' 字面量：打包器会把源码中的控制字符剔除导致变成空串
const TAG_SEP = String.fromCharCode(31);

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
	// 子查询列必须全限定：drizzle 模板列引用生成无表限定 "id"，会被 SQLite 解析为内层表列导致错误关联
	const rows = await db.all<{
		id: number;
		slug: string;
		title: string;
		description: string;
		heroImage: string | null;
		publishedAt: Date;
		readingMinutes: number;
		tags: string | null;
	}>(sql`
		select p.id, p.slug, p.title, p.description, p.hero_image as heroImage,
			p.published_at as publishedAt, p.reading_minutes as readingMinutes,
			(
				select group_concat(t.name, ${TAG_SEP})
				from post_tags pt join tags t on t.id = pt.tag_id
				where pt.post_id = p.id
			) as tags
		from posts p
		where p.status = 'published' and p.deleted_at is null
		order by p.published_at desc
	`);

	return rows.map((r) => ({
		id: r.id,
		slug: r.slug,
		title: r.title,
		description: r.description,
		heroImage: r.heroImage,
		publishedAt: new Date(r.publishedAt),
		readingMinutes: r.readingMinutes,
		tags: r.tags ? r.tags.split(TAG_SEP) : [],
	}));
}

/** 单篇文章详情（含标签） */
export async function getPostBySlug(db: Db, slug: string): Promise<PostDetail | null> {
	const rows = await db.all<{
		id: number;
		slug: string;
		title: string;
		description: string;
		contentHtml: string;
		contentMd: string;
		heroImage: string | null;
		publishedAt: Date;
		updatedAt: Date | null;
		readingMinutes: number;
		tags: string | null;
	}>(sql`
		select p.id, p.slug, p.title, p.description, p.content_html as contentHtml, p.content_md as contentMd,
			p.hero_image as heroImage, p.published_at as publishedAt, p.updated_at as updatedAt,
			p.reading_minutes as readingMinutes,
			(
				select group_concat(t.name, ${TAG_SEP})
				from post_tags pt join tags t on t.id = pt.tag_id
				where pt.post_id = p.id
			) as tags
		from posts p
		where p.slug = ${slug} and p.status = 'published' and p.deleted_at is null
		limit 1
	`);

	const row = rows[0];
	if (!row) return null;
	return {
		...row,
		publishedAt: new Date(row.publishedAt),
		updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
		tags: row.tags ? row.tags.split(TAG_SEP) : [],
	};
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
	// 子查询列全限定，理由同 listPosts
	const rows = await db.all<{ title: string; slug: string; readingMinutes: number }>(sql`
		select p.title, p.slug, p.reading_minutes as "readingMinutes"
		from posts p
		where p.status = 'published' and p.deleted_at is null and p.id != ${postId}
			and (
				select count(*)
				from post_tags pt join tags t on t.id = pt.tag_id
				where pt.post_id = p.id and t.name in (${sql.join(
					postTags_.map((t) => sql`${t}`),
					sql`, `,
				)})
			) > 0
		order by (
			select count(*)
			from post_tags pt join tags t on t.id = pt.tag_id
			where pt.post_id = p.id and t.name in (${sql.join(
				postTags_.map((t) => sql`${t}`),
				sql`, `,
			)})
		) desc, p.published_at desc
		limit ${limit}
	`);

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
	const rows = await db.all<{
		slug: string;
		title: string;
		description: string;
		contentMd: string;
		publishedAt: Date;
		tags: string | null;
	}>(sql`
		select p.slug, p.title, p.description, p.content_md as contentMd, p.published_at as publishedAt,
			(
				select group_concat(t.name, ${TAG_SEP})
				from post_tags pt join tags t on t.id = pt.tag_id
				where pt.post_id = p.id
			) as tags
		from posts p
		where p.status = 'published' and p.deleted_at is null
		order by p.published_at desc
	`);

	return rows.map((r) => ({
		...r,
		publishedAt: new Date(r.publishedAt),
		tags: r.tags ? r.tags.split(TAG_SEP) : [],
	}));
}
