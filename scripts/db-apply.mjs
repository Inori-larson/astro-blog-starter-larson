/**
 * 按顺序执行 drizzle/ 下的迁移 SQL 到本地（或远程 REMOTE=1）D1
 * 用法：node scripts/db-apply.mjs [--remote]
 */
import { readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const remote = process.argv.includes('--remote') || process.env.REMOTE === '1';
const dir = new URL('../drizzle/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

if (!existsSync(dir)) {
	console.error('未找到 drizzle/ 目录，请先运行 npm run db:generate');
	process.exit(1);
}

const files = readdirSync(dir)
	.filter((f) => f.endsWith('.sql') && f !== 'seed.sql')
	.sort();

if (!files.length) {
	console.log('没有待执行的迁移文件');
	process.exit(0);
}

for (const file of files) {
	const flag = remote ? '--remote' : '--local';
	console.log(`→ 应用迁移 ${file} (${remote ? '远程' : '本地'})`);
	execSync(`npx wrangler d1 execute larson-blog-db ${flag} --file "${dir}${file}"`, {
		stdio: 'inherit',
	});
}
console.log(`✓ 全部 ${files.length} 个迁移已应用`);
