export interface FriendLink {
	name: string;
	url: string;
	description: string;
	gradient: string;
}

export const friendLinks: FriendLink[] = [
	{
		name: 'Astro 官方文档',
		url: 'https://docs.astro.build',
		description: '本站使用的框架，宇宙最快的 Web 内容站点框架。',
		gradient: 'from-orange-400 to-rose-500',
	},
	{
		name: 'Tailwind CSS',
		url: 'https://tailwindcss.com',
		description: '原子化 CSS 框架，本站样式的基石。',
		gradient: 'from-sky-400 to-cyan-500',
	},
	{
		name: 'MDN Web Docs',
		url: 'https://developer.mozilla.org/zh-CN/',
		description: 'Web 开发者最重要的参考资料，没有之一。',
		gradient: 'from-slate-500 to-zinc-600',
	},
	{
		name: 'Cloudflare Docs',
		url: 'https://developers.cloudflare.com/',
		description: '本站部署与后端服务所依赖的边缘云平台。',
		gradient: 'from-amber-400 to-orange-500',
	},
	{
		name: 'GitHub',
		url: 'https://github.com',
		description: '代码托管与开源协作的家。',
		gradient: 'from-zinc-600 to-zinc-800',
	},
];
