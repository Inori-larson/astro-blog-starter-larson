import { eq, inArray, sql } from 'drizzle-orm';
import { postTags, tags } from '../db/schema';
import type { Db } from './db';
import GithubSlugger from 'github-slugger';

/**
 * 文章标签同步：删除旧关联 → 批量补齐缺失标签 → 批量插入关联 → 清理僵尸标签
 * 全程 batch，避免 N+1 次数据库往返
 */
export async function syncTags(db: Db, postId: number, tagNames: string[]): Promise<void> {
	await db.delete(postTags).where(eq(postTags.postId, postId));

	const names = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))].slice(0, 10);
	if (names.length) {
		// 一次取回已存在标签
		const existing = await db.select({ id: tags.id, name: tags.name }).from(tags).where(inArray(tags.name, names));
		const existingNames = new Set(existing.map((t) => t.name));

		// 批量插入缺失标签与全部关联
		const slugger = new GithubSlugger();
		const toInsert = names
			.filter((n) => !existingNames.has(n))
			.map((name) => ({ name, slug: slugger.slug(name) }));
		if (toInsert.length) await db.insert(tags).values(toInsert);

		const all = await db.select({ id: tags.id, name: tags.name }).from(tags).where(inArray(tags.name, names));
		if (all.length) {
			await db.insert(postTags).values(all.map((t) => ({ postId, tagId: t.id })));
		}
	}

	// 清理无任何文章引用的僵尸标签（单条 SQL，低频后台操作）
	await db.run(sql`delete from tags where id not in (select distinct tag_id from post_tags)`);
}
