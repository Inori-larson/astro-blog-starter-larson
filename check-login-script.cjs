const { ProxyAgent, setGlobalDispatcher } = require('undici');
setGlobalDispatcher(new ProxyAgent('http://127.0.0.1:10808'));

(async () => {
	const t = await (await fetch('https://blog.larson.it.com/admin/login')).text();
	console.log('登录页含新代码(toggleBound):', t.includes('toggleBound') ? 'Y' : 'N');
	console.log('含守卫标记代码:', t.includes('themeToggleReady') ? 'Y' : 'N');
	const m = /<script([^>]*)>[^<]*toggleBound/.exec(t);
	console.log('脚本标签形态:', m ? m[1] : '未找到内联（可能外链）');
	const src = /src="([^"]*ThemeToggle[^"]*)"/.exec(t);
	console.log('外链脚本:', src ? src[1] : '无');
})().catch((e) => console.log('FAIL', e.message));
