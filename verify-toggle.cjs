// 线上验证：点击 theme-toggle 后 dark 类应切换
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9324;

function getJSON(path) {
	return new Promise((resolve, reject) => {
		http.get({ host: '127.0.0.1', port: PORT, path }, (res) => {
			let data = '';
			res.on('data', (c) => (data += c));
			res.on('end', () => resolve(JSON.parse(data)));
		}).on('error', reject);
	});
}

(async () => {
	const proc = spawn(CHROME, [
		`--remote-debugging-port=${PORT}`,
		'--headless=new',
		'--no-first-run',
		'--proxy-server=http://127.0.0.1:10808',
		'--user-data-dir=' + process.env.TEMP + '\\chrome-verify-profile',
		'about:blank',
	], { stdio: 'ignore' });
	await new Promise((r) => setTimeout(r, 3000));

	const targets = await getJSON('/json/list');
	const page = targets.find((t) => t.type === 'page');
	const ws = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject); });

	let msgId = 0;
	const send = (method, params = {}) =>
		new Promise((resolve) => {
			const id = ++msgId;
			const onMsg = (raw) => {
				const msg = JSON.parse(raw);
				if (msg.id === id) { ws.off('message', onMsg); resolve(msg.result); }
			};
			ws.on('message', onMsg);
			ws.send(JSON.stringify({ id, method, params }));
		});

	await send('Page.enable');
	await send('Runtime.enable');

	const evalExpr = async (expr) => {
		const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
		return res.result?.value;
	};

	// 场景 1：首页加载后点击
	await send('Page.navigate', { url: 'https://blog.larson.it.com/' });
	await new Promise((r) => setTimeout(r, 6000));
	await evalExpr(`document.getElementById('theme-toggle').click()`);
	await new Promise((r) => setTimeout(r, 400));
	const homeDark = await evalExpr('document.documentElement.classList.contains("dark")');
	console.log('首页点击切换:', homeDark ? '✓ 生效' : '✗ 失效');

	// 再点一次（切回浅色）验证双向
	await evalExpr(`document.getElementById('theme-toggle').click()`);
	await new Promise((r) => setTimeout(r, 400));
	const homeLight = await evalExpr('document.documentElement.classList.contains("dark")');
	console.log('首页再次点击切回:', !homeLight ? '✓ 生效' : '✗ 失效');

	// 场景 2：软导航到博客页后点击
	await evalExpr(`document.querySelector('a[href="/blog"]')?.click()`);
	await new Promise((r) => setTimeout(r, 3000));
	await evalExpr(`document.getElementById('theme-toggle').click()`);
	await new Promise((r) => setTimeout(r, 400));
	const blogDark = await evalExpr('document.documentElement.classList.contains("dark")');
	console.log('软导航后点击切换:', blogDark ? '✓ 生效' : '✗ 失效');

	// 场景 3：登录页（无 ClientRouter）
	await send('Page.navigate', { url: 'https://blog.larson.it.com/admin/login' });
	await new Promise((r) => setTimeout(r, 5000));
	await evalExpr(`document.getElementById('theme-toggle').click()`);
	await new Promise((r) => setTimeout(r, 400));
	const loginDark = await evalExpr('document.documentElement.classList.contains("dark")');
	console.log('登录页点击切换:', loginDark ? '✓ 生效' : '✗ 失效');

	ws.close();
	proc.kill();
	process.exit(0);
})().catch((e) => { console.log('FAIL', e.message); process.exit(1); });
