import { sqliteTable, text, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';

/** 管理员（第 3 期后台登录使用） */
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name').notNull(),
	role: text('role', { enum: ['admin', 'editor'] }).notNull().default('admin'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

/** 文章 */
export const posts = sqliteTable(
	'posts',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		description: text('description').notNull().default(''),
		/** 原始 Markdown */
		contentMd: text('content_md').notNull().default(''),
		/** 写入时预渲染的 HTML（避免运行时渲染开销） */
		contentHtml: text('content_html').notNull().default(''),
		heroImage: text('hero_image'),
		status: text('status', { enum: ['draft', 'published'] }).notNull().default('published'),
		publishedAt: integer('published_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
		readingMinutes: integer('reading_minutes').notNull().default(1),
		authorId: integer('author_id').references(() => users.id),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
		deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
	},
	(t) => [
		index('idx_posts_status_published').on(t.status, t.publishedAt),
		index('idx_posts_published_at').on(t.publishedAt),
	],
);

/** 标签 */
export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
});

/** 文章-标签 多对多 */
export const postTags = sqliteTable(
	'post_tags',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' }),
	},
	(t) => [primaryKey({ columns: [t.postId, t.tagId] }), index('idx_post_tags_tag').on(t.tagId)],
);

/** 评论（第 2 期） */
export const comments = sqliteTable(
	'comments',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		parentId: integer('parent_id'),
		authorName: text('author_name').notNull(),
		authorEmail: text('author_email'),
		authorUrl: text('author_url'),
		content: text('content').notNull(),
		status: text('status', { enum: ['pending', 'approved', 'spam'] }).notNull().default('pending'),
		ipHash: text('ip_hash'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
	},
	(t) => [index('idx_comments_post_status').on(t.postId, t.status)],
);

/** 点赞（第 2 期） */
export const reactions = sqliteTable(
	'reactions',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		visitorHash: text('visitor_hash').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
	},
	(t) => [primaryKey({ columns: [t.postId, t.visitorHash] })],
);

/** 浏览量按天聚合（第 2 期） */
export const viewStats = sqliteTable(
	'view_stats',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		date: text('date').notNull(), // YYYY-MM-DD
		count: integer('count').notNull().default(0),
	},
	(t) => [primaryKey({ columns: [t.postId, t.date] })],
);

/** 邮件订阅者（第 4 期） */
export const subscribers = sqliteTable('subscribers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
	token: text('token').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

/** 媒体库元数据，文件本体在 R2（第 3 期） */
export const media = sqliteTable('media', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	r2Key: text('r2_key').notNull().unique(),
	filename: text('filename').notNull(),
	mime: text('mime').notNull(),
	size: integer('size').notNull(),
	width: integer('width'),
	height: integer('height'),
	duration: integer('duration'),
	alt: text('alt'),
	uploaderId: integer('uploader_id').references(() => users.id),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

/** 站点设置（后台可改标题/页脚等） */
export const settings = sqliteTable('settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
});

export type Post = typeof posts.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
