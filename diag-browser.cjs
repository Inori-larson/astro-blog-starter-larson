// 用 Chrome/Edge 无头模式 + CDP 验证线上主题切换
// 1. 启动无头浏览器（带代理）打开首页
// 2. 点击 theme-toggle 按钮
// 3. 检查 html.dark 是否切换
const { spawn } = require('child_process');
const http = require('http');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

function getJSON(path) {
	return new Promise((resolve, reject) => {
		http.get({ host: '127.0.0.1', port: PORT, path }, (res) => {
			let data = '';
			res.on('data', (c) => (data += c));
			res.on('end', () => resolve(JSON.parse(data)));
		}).on('error', reject);
	});
}

function send(wsId, method, params = {}) {
	return new Promise((resolve, reject) => {
		const id = ++seq;
		pending.set(id, resolve);
		const msg = JSON.stringify({ id, method, params });
		const req = http.request(
			{ host: '127.0.0.1', port: PORT, path: `/json/protocol` , method: 'OPTIONS'},
			() => {}
		);
		req.destroy();
		// CDP over HTTP 不支持命令，只支持 WebSocket —— 改用 /json/list + ws
		reject(new Error('need ws'));
	});
}
let seq = 0;
const pending = new Map();

(async () => {
	const proc = spawn(CHROME, [
		`--remote-debugging-port=${PORT}`,
		'--headless=new',
		'--no-first-run',
		'--proxy-server=http://127.0.0.1:10808',
		'--user-data-dir=' + process.env.TEMP + '\\chrome-test-profile',
		'about:blank',
	], { stdio: 'ignore' });

	await new Promise((r) => setTimeout(r, 3000));

	const targets = await getJSON('/json/list');
	const page = targets.find((t) => t.type === 'page');
	console.log('目标页:', page ? page.url : 'none');

	// 用 WebSocket 连接 CDP
	const WebSocket = require('ws');
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
	const { frameTree } = await send('Page.getFrameTree');
	const frameId = frameTree.frame.id;
	await send('Page.navigate', { url: 'https://blog.larson.it.com/' });
	await new Promise((r) => setTimeout(r, 6000));

	// 检查初始状态
	const evalExpr = async (expr) => {
		const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
		return res.result?.value;
	};
	console.log('初始 dark:', await evalExpr('document.documentElement.classList.contains("dark")'));
	console.log('按钮存在:', await evalExpr('!!document.getElementById("theme-toggle")'));
	console.log('守卫标记:', await evalExpr('document.documentElement.dataset.themeToggleReady || "未设置"'));
	// 有多少个监听器无法直接查，但可以查按钮是否可点击触发
	await evalExpr('document.getElementById("theme-toggle").click()');
	await new Promise((r) => setTimeout(r, 500));
	const after = await evalExpr('document.documentElement.classList.contains("dark")');
	console.log('点击后 dark:', after, after ? '✓ 切换生效' : '✗ 切换失效');

	ws.close();
	proc.kill();
	process.exit(0);
})().catch((e) => { console.log('FAIL', e.message); process.exit(1); });
