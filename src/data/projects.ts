export type ProjectStatus = 'active' | 'maintained' | 'finished' | 'planned';

export interface Project {
	name: string;
	description: string;
	tags: string[];
	url?: string;
	repo?: string;
	status: ProjectStatus;
	featured?: boolean;
	icon: string;
	gradient: string;
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
	active: '进行中',
	maintained: '维护中',
	finished: '已完成',
	planned: '规划中',
};

export const projects: Project[] = [
	{
		name: 'Astro 博客 2.0',
		description:
			'你正在浏览的网站。基于 Astro + Cloudflare Workers 的全栈博客，包含评论、全文搜索、后台管理与媒体库。',
		tags: ['Astro', 'TypeScript', 'Cloudflare'],
		url: '/',
		repo: 'https://github.com/withastro/astro',
		status: 'active',
		featured: true,
		icon: '🚀',
		gradient: 'from-indigo-500 via-violet-500 to-fuchsia-500',
	},
	{
		name: 'Nova UI',
		description:
			'轻量级 Vue 组件库，零依赖、按需加载，提供 30+ 常用组件与完整的暗色模式支持。',
		tags: ['Vue', 'Vite', '组件库'],
		repo: 'https://github.com/withastro/astro',
		status: 'maintained',
		featured: true,
		icon: '🎨',
		gradient: 'from-sky-500 to-cyan-400',
	},
	{
		name: 'Tiny CLI',
		description: '一套零依赖的命令行工具集，把日常重复操作压缩成一条命令。',
		tags: ['Node.js', 'CLI'],
		repo: 'https://github.com/withastro/astro',
		status: 'finished',
		icon: '⚙️',
		gradient: 'from-emerald-500 to-teal-400',
	},
	{
		name: 'DataLens',
		description: '面向个人用户的数据可视化仪表盘，拖拽配置、实时刷新、一键分享。',
		tags: ['React', 'D3.js', '数据可视化'],
		url: 'https://example.com',
		status: 'active',
		icon: '📊',
		gradient: 'from-amber-500 to-orange-500',
	},
	{
		name: 'MarkFlow',
		description: 'Markdown 预处理器，支持自定义指令、变量替换与图表语法扩展。',
		tags: ['Markdown', '编译器'],
		repo: 'https://github.com/withastro/astro',
		status: 'maintained',
		icon: '📝',
		gradient: 'from-rose-500 to-pink-500',
	},
	{
		name: 'Codex Snippets',
		description: '本地优先的代码片段管理器，支持全文搜索与团队同步（构思中）。',
		tags: ['Rust', 'Tauri'],
		status: 'planned',
		icon: '🧩',
		gradient: 'from-fuchsia-500 to-purple-600',
	},
];
