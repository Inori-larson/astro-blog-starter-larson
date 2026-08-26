/**
 * 种子导入脚本：scripts/seed-content/*.md → drizzle/seed.sql
 * 用法：node scripts/import-seed.mjs
 * 之后执行：npm run db:apply-seed（wrangler d1 execute --local --file drizzle/seed.sql）
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import { renderMarkdown, readingTimeMinutes } from '../src/lib/markdown.mjs';

const dir = new URL('./seed-content/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));

const slugify = (s) => new GithubSlugger().slug(s);

function sqlStr(value) {
	if (value === null || value === undefined) return 'NULL';
	return `'${String(value).replaceAll("'", "''")}'`;
}

const postsValues = [];
const tagsSet = new Map(); // name -> slug
const postTagsRows = [];
const publishedAtSet = [];

const sorted = files.sort((a, b) => a.localeCompare(b));
const rendered = [];

for (const file of sorted) {
	const raw = readFileSync(join(dir, file), 'utf8');
	const { data, content } = matter(raw);
	const slug = file.replace(/\.md$/, '');
	const publishedAt = new Date(data.pubDate);
	const updatedAt = data.updatedDate ? new Date(data.updatedDate) : null;
	const { html } = await renderMarkdown(content);
	const minutes = readingTimeMinutes(content);

	rendered.push({ slug, data, content, html, minutes, publishedAt, updatedAt });

	postsValues.push(
		`(${sqlStr(slug)}, ${sqlStr(data.title)}, ${sqlStr(data.description ?? '')}, ${sqlStr(content)}, ${sqlStr(html)}, ${sqlStr(data.heroImage ?? null)}, 'published', ${publishedAt.getTime()}, ${updatedAt ? updatedAt.getTime() : 'NULL'}, ${minutes}, NULL, ${publishedAt.getTime()}, NULL)`,
	);
	publishedAtSet.push(publishedAt.getTime());
	for (const t of data.tags ?? []) {
		tagsSet.set(t, slugify(t));
	}
}

// 标签 → id（从 1 开始自增）
const tagIds = new Map([...tagsSet.keys()].map((name, i) => [name, i + 1]));
for (const r of rendered) {
	const postId = rendered.indexOf(r) + 1;
	for (const t of r.data.tags ?? []) {
		postTagsRows.push(`(${postId}, ${tagIds.get(t)})`);
	}
}

const lines = [];
lines.push('-- 种子数据：由 scripts/import-seed.mjs 生成，勿手改');
lines.push('DELETE FROM post_tags;');
lines.push('DELETE FROM posts;');
lines.push('DELETE FROM tags;');
lines.push('INSERT INTO posts (slug, title, description, content_md, content_html, hero_image, status, published_at, updated_at, reading_minutes, author_id, created_at, deleted_at) VALUES');
lines.push(postsValues.join(',\n') + ';');
lines.push('INSERT INTO tags (name, slug) VALUES');
lines.push([...tagsSet].map(([name, slug]) => `(${sqlStr(name)}, ${sqlStr(slug)})`).join(',\n') + ';');
if (postTagsRows.length) {
	lines.push('INSERT INTO post_tags (post_id, tag_id) VALUES');
	lines.push(postTagsRows.join(',\n') + ';');
}
lines.push(`INSERT OR IGNORE INTO settings (key, value) VALUES ('seeded_at', ${sqlStr(new Date().toISOString())});`);

mkdirSync(new URL('../drizzle/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), { recursive: true });
const outPath = new URL('../drizzle/seed.sql', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
writeFileSync(outPath, lines.join('\n'), 'utf8');

console.log(`✓ ${rendered.length} 篇文章、${tagsSet.size} 个标签 → ${outPath}`);
