export interface FriendLink {
	name: string;
	url: string;
	description: string;
	gradient: string;
}

/** 友链：我常逛的博客与站点（替换为你和朋友的真实链接即可） */
export const friendLinks: FriendLink[] = [
	{
		name: "阮一峰的网络日志",
		url: 'https://www.ruanyifeng.com/blog/',
		description: '每周坚持更新的技术周刊，我保持阅读习惯的起点。',
		gradient: 'from-sky-500 to-blue-600',
	},
	{
		name: '酷壳 COOLSHELL',
		url: 'https://coolshell.cn',
		description: '左耳朵耗子的技术博客，虽已停更，依然常读常新。',
		gradient: 'from-zinc-600 to-zinc-800',
	},
	{
		name: 'MDN Web Docs',
		url: 'https://developer.mozilla.org/zh-CN/',
		description: 'Web 开发最重要的参考资料，没有之一。',
		gradient: 'from-slate-500 to-zinc-600',
	},
	{
		name: 'GitHub',
		url: 'https://github.com',
		description: '代码托管与开源协作的家，我的大部分项目都在这里。',
		gradient: 'from-purple-500 to-fuchsia-600',
	},
	{
		name: 'Cloudflare Docs',
		url: 'https://developers.cloudflare.com/',
		description: '本站部署所依赖的边缘云平台，文档质量很高。',
		gradient: 'from-amber-400 to-orange-500',
	},
];
