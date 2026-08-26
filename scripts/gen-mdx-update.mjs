// 生成 using-mdx 的非破坏性更新 SQL（含预渲染 HTML）
import { readFileSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';
import { renderMarkdown } from '../src/lib/markdown.mjs';

const raw = readFileSync('scripts/seed-content/using-mdx.md', 'utf8');
const { content } = matter(raw);
const { html } = await renderMarkdown(content);

const sqlStr = (v) => `'${String(v).replaceAll("'", "''")}'`;
const sql = `update posts set content_md = ${sqlStr(content)}, content_html = ${sqlStr(html)}, updated_at = ${Date.now()} where slug = 'using-mdx';\n`;
writeFileSync('drizzle/update-mdx.sql', sql, 'utf8');
console.log('✓ drizzle/update-mdx.sql 已生成（含渲染 HTML，非破坏性 UPDATE）');
