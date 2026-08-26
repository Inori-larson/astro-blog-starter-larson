/**
 * 创建/重置管理员账号
 * 用法：node scripts/create-admin.mjs [email] [password]
 * 密码也可通过环境变量 ADMIN_PASSWORD 提供；默认读 .dev.vars
 * 生成 SQL 后执行：npx wrangler d1 execute larson-blog-db --local/--remote --file drizzle/admin.sql
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

// PBKDF2 哈希（与 src/lib/auth.ts 保持一致）
const ITER = 100_000;
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));

async function hashPassword(password) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
	const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256);
	return `pbkdf2$${ITER}$${toHex(salt.buffer)}$${toHex(bits)}`;
}

// 读取 .dev.vars 默认值
const defaults = {};
if (existsSync('.dev.vars')) {
	for (const line of readFileSync('.dev.vars', 'utf8').split('\n')) {
		const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
		if (m) defaults[m[1]] = m[2];
	}
}

const [, , argEmail, argPassword] = process.argv;
const email = argEmail || defaults.ADMIN_EMAIL || 'hi@larson.dev';
const name = defaults.ADMIN_NAME || 'Larson';

let password = argPassword || process.env.ADMIN_PASSWORD;
if (!password) {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	password = await rl.question(`为 ${email} 设置密码（至少 8 位）：`);
	rl.close();
}
if (password.length < 8) {
	console.error('密码至少 8 位');
	process.exit(1);
}

const hash = await hashPassword(password);
const now = Date.now();
const sql = [
	'-- 管理员账号（由 scripts/create-admin.mjs 生成）',
	// upsert：同邮箱覆盖
	`delete from users where email = '${email.replaceAll("'", "''")}';`,
	`insert into users (email, password_hash, name, role, created_at) values ('${email.replaceAll("'", "''")}', '${hash}', '${name.replaceAll("'", "''")}', 'admin', ${now});`,
].join('\n');

writeFileSync('drizzle/admin.sql', sql, 'utf8');
console.log(`✓ 管理员 ${email} 已生成 → drizzle/admin.sql`);
console.log('  本地应用：npx wrangler d1 execute larson-blog-db --local --file drizzle/admin.sql');
console.log('  远程应用：npx wrangler d1 execute larson-blog-db --remote --file drizzle/admin.sql');
console.log('  （远程还需设置密钥：npx wrangler secret put AUTH_SECRET）');
