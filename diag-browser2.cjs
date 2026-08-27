// 深挖：为什么守卫设置了但点击无效
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;

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
		'--user-data-dir=' + process.env.TEMP + '\\chrome-test-profile2',
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
	await send('Page.navigate', { url: 'https://blog.larson.it.com/' });
	await new Promise((r) => setTimeout(r, 6000));

	const evalExpr = async (expr) => {
		const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
		return res.result?.value;
	};

	// 1. 手动注入一个测试监听器，验证按钮本身可交互
	await evalExpr(`
		window.__testClicked = 0;
		document.getElementById('theme-toggle').addEventListener('click', () => window.__testClicked++);
	`);
	await evalExpr(`document.getElementById('theme-toggle').click()`);
	console.log('测试监听器触发次数:', await evalExpr('window.__testClicked'), '（>0 说明按钮可点击）');

	// 2. 查 module 脚本是否真的执行过绑定（对比：手动调用脚本代码是否有效）
	console.log('当前守卫标记:', await evalExpr(`document.documentElement.dataset.themeToggleReady || '未设置'`));
	// 3. 重新执行一遍绑定逻辑（模拟脚本），再点击
	await evalExpr(`
		const t = () => { const e = document.getElementById('theme-toggle'); if (e) e.addEventListener('click', () => {
			const n = document.documentElement.classList.toggle('dark');
			localStorage.setItem('theme', n ? 'dark' : 'light');
		}); };
		t();
	`);
	await evalExpr(`document.getElementById('theme-toggle').click()`);
	await new Promise((r) => setTimeout(r, 300));
	console.log('手动绑定+点击后 dark:', await evalExpr('document.documentElement.classList.contains("dark")'));

	// 4. 查页面加载时脚本报错（console）
	const logs = [];
	ws.on('message', (raw) => {
		const msg = JSON.parse(raw);
		if (msg.method === 'Runtime.consoleAPICalled' || msg.method === 'Runtime.exceptionThrown') logs.push(msg);
	});
	await send('Page.navigate', { url: 'https://blog.larson.it.com/blog' });
	await new Promise((r) => setTimeout(r, 5000));
	await evalExpr(`document.getElementById('theme-toggle').click()`);
	await new Promise((r) => setTimeout(r, 300));
	console.log('软导航后点击 dark:', await evalExpr('document.documentElement.classList.contains("dark")'));
	console.log('捕获的 console/异常数:', logs.length);
	for (const l of logs.slice(0, 5)) {
		const text = l.params?.exception?.description || (l.params?.args || []).map((a) => a.value).join(' ');
		console.log('  log:', String(text).slice(0, 120));
	}

	ws.close();
	proc.kill();
	process.exit(0);
})().catch((e) => { console.log('FAIL', e.message); process.exit(1); });
