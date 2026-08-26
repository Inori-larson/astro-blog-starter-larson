const { ProxyAgent, setGlobalDispatcher } = require('undici');
setGlobalDispatcher(new ProxyAgent('http://127.0.0.1:10808'));
const BASE = 'https://larson-blog.gg935636808.workers.dev';
const J = { 'Content-Type': 'application/json' };

const log = (name, r, extra = '') =>
	console.log(String(r.status).padEnd(4), name.padEnd(36), extra || JSON.stringify(r.data ?? '').slice(0, 70));

async function j(url, opts = {}) {
	const res = await fetch(BASE + url, { headers: J, ...opts });
	let data = null;
	try { data = await res.json(); } catch {}
	return { status: res.status, data };
}

(async () => {
	// 登录页
	const loginPage = await fetch(BASE + '/admin/login');
	console.log(String(loginPage.status).padEnd(4), '/admin/login 页面');

	// 守卫：未登录访问后台 → 跳登录页
	const guard = await fetch(BASE + '/admin/', { redirect: 'manual' });
	console.log(String(guard.status).padEnd(4), '/admin/ 未登录跳转', '→ ' + (guard.headers.get('location') || '-'));

	// 错误密码
	log('login 错误密码 (401)', await j('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@larson.dev', password: 'nope' }) }));

	// 正确登录
	const login = await fetch(BASE + '/api/auth/login', {
		method: 'POST',
		headers: J,
		body: JSON.stringify({ email: 'admin@larson.dev', password: 'SuperSecret123!' }),
	});
	const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
	console.log(String(login.status).padEnd(4), 'login', cookie ? '(cookie ok)' : '(NO COOKIE)');

	const auth = { ...J, Cookie: cookie };

	// 后台页面（带会话）
	const adminPage = await fetch(BASE + '/admin/', { headers: { Cookie: cookie } });
	const adminHtml = await adminPage.text();
	console.log(String(adminPage.status).padEnd(4), '/admin/ 仪表盘', '侧边栏=' + adminHtml.includes('后台管理'));

	// 统计
	log('stats', await j('/api/admin/stats', { headers: { Cookie: cookie } }), '');

	// 新建文章并发布
	const created = await j('/api/admin/posts', {
		method: 'POST',
		headers: auth,
		body: JSON.stringify({
			title: '你好，世界：博客 2.0 上线',
			description: '通过后台编辑器发布的第一篇文章。',
			contentMd: '## 你好，世界\n\n这是通过**后台编辑器**发布的文章。\n\n```js\nconsole.log("blog 2.0");\n```\n',
			tags: ['公告'],
			status: 'published',
		}),
	});
	log('新建+发布文章', created, 'slug=' + created.data?.slug);

	// 前台可见
	const post = await fetch(BASE + `/blog/${created.data.slug}/`);
	const html = await post.text();
	console.log(String(post.status).padEnd(4), '前台文章页', 'shiki=' + html.includes('astro-code') + ' like=' + html.includes('like-button'));

	// 清理：软删除测试文章
	log('删除测试文章', await j(`/api/admin/posts/${created.data.id}`, { method: 'DELETE', headers: auth }));

	// 退出
	log('logout', await j('/api/auth/logout', { method: 'POST', headers: auth }));
})().catch((e) => console.log('FAIL', e.message));
