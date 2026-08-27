import { like } from 'drizzle-orm';
import { settings } from '../db/schema';
import { getDb } from './db';
import { cached } from './cache';

/**
 * 站点文案设置：后台「站点设置」页编辑，前台首页 Hero 与关于页展示。
 * - 文本字段存 D1 settings 表（key 前缀 site.），数组/结构化字段存 JSON
 * - 文案字段支持样式：颜色存 `${key}_color`（#RRGGBB），字体存 `${key}_font`（预设键）
 * - 读取经 KV 两级缓存（key: settings:site），后台保存后 invalidateCache 全量失效
 */

export interface TimelineItem {
	date: string;
	title: string;
	desc: string;
}

/** 字体预设（不引入外部字体文件，均为系统字体栈） */
export const FONT_PRESETS: Record<string, { label: string; stack: string }> = {
	serif: { label: '衬线 / 宋体', stack: 'Georgia, "Times New Roman", "Songti SC", "SimSun", serif' },
	kai: { label: '楷体', stack: '"Kaiti SC", KaiTi, STKaiti, "TW-Kai", serif' },
	fangsong: { label: '仿宋', stack: 'FangSong, STFangsong, "Songti SC", serif' },
	mono: { label: '等宽', stack: 'ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace' },
};

/** 可样式化文案：文本 + 颜色（空=跟随主题）+ 字体（空=跟随站点） */
export interface StyledText {
	text: string;
	color: string;
	font: string;
}

function st(text: string): StyledText {
	return { text, color: '', font: '' };
}

export interface SiteSettings {
	/** 站点标题（浏览器标签、导航栏、RSS） */
	siteTitle: string;
	/** 站点 Logo（R2 图片 URL，空则用标题首字母渐变块） */
	siteLogo: string;
	/** 站长头像（R2 图片 URL，空则用名称首字母渐变圆） */
	ownerAvatar: string;
	heroGreeting: StyledText;
	heroName: StyledText;
	heroTaglineLight: StyledText;
	heroTaglineDark: StyledText;
	heroBio: StyledText;
	aboutRole: StyledText;
	aboutBadges: string[];
	aboutBio: StyledText;
	aboutTimeline: TimelineItem[];
	aboutContactTitle: StyledText;
	aboutContactDesc: StyledText;
	aboutContactEmail: string;
}

/** 初始文案 = 当前写死在页面里的内容，未入库时兜底 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
	siteTitle: "Larson's Blog",
	siteLogo: '',
	ownerAvatar: '',
	heroGreeting: st('你好，我是'),
	heroName: st('Larson'),
	heroTaglineLight: st('欢迎回到港区'),
	heroTaglineDark: st('圣杯问答，今夜开始'),
	heroBio: st('一名爱写代码也爱写文字的开发者。在这里记录技术笔记、项目复盘与生活随想，把踩过的坑写成文字，分享给同样在路上的人。'),
	aboutRole: st('开发者 · 写字的人 · 终身学习者'),
	aboutBadges: ['写代码', '做产品', '记录生活', '开源爱好者'],
	aboutBio: st(
		'我是 {name}，一名热爱技术与分享的开发者。平时喜欢研究新工具、折腾各种小项目，也乐于把踩过的坑整理成文章，分享给遇到同样问题的人。\n\n这个博客是我的数字自留地，主要记录三类内容：**技术笔记**，梳理我在学习和开发过程中的思路与解决方案；**项目复盘**，总结每次实践的收获与不足；**生活随想**，让这个站点不只是冷冰冰的技术文档。\n\n我始终相信，写作是最好的学习方式之一。把一件事讲清楚，远比把它做出来更难，也更有价值。因此我会尽量把每篇文章写得通俗易懂，希望能帮到你，哪怕只是一点点。\n\n工作之外，我喜欢阅读、跑步和摄影——虽然水平都一般，但足够让生活保持新鲜感。如果你对站点的某篇文章有疑问，或者想和我交流任何话题，欢迎随时给我发邮件。你的每一条反馈，都会成为我持续写作的动力。',
	),
	aboutTimeline: [
		{ date: '2021', title: '写下第一篇博客', desc: '从一篇笨拙的笔记开始，养成记录的习惯。' },
		{ date: '2022', title: '搭建独立站点', desc: '告别平台托管，拥有完全属于自己的数字空间。' },
		{ date: '2024', title: '找到趁手的工具链', desc: '打磨写作工作流，让专注回归内容本身。' },
		{ date: '2026', title: '博客 2.0 改版', desc: '全新视觉、暗色模式、全文搜索，把站点做成自己喜欢的样子。' },
	],
	aboutContactTitle: st('想和我聊聊？'),
	aboutContactDesc: st('无论是技术交流、合作意向，还是单纯打个招呼，都欢迎随时联系。'),
	aboutContactEmail: '935636808@qq.com',
};

/** 可样式化字段 → settings 表基础键（颜色/字体存 `${key}_color` / `${key}_font`） */
const STYLED_KEYS = {
	heroGreeting: 'site.hero_greeting',
	heroName: 'site.hero_name',
	heroTaglineLight: 'site.hero_tagline_light',
	heroTaglineDark: 'site.hero_tagline_dark',
	heroBio: 'site.hero_bio',
	aboutRole: 'site.about_role',
	aboutBio: 'site.about_bio',
	aboutContactTitle: 'site.about_contact_title',
	aboutContactDesc: 'site.about_contact_desc',
} as const;
type StyledField = keyof typeof STYLED_KEYS;

const SIMPLE_KEYS = {
	siteTitle: 'site.title',
	siteLogo: 'site.logo',
	ownerAvatar: 'site.owner_avatar',
} as const;

const BADGE_KEY = 'site.about_badges';
const TIMELINE_KEY = 'site.about_timeline';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/** 读取站点设置（KV 缓存 5 分钟，保存时主动失效；任何异常回退默认值，不阻塞页面渲染） */
export async function getSiteSettings(ctx: { locals: App.Locals }, db: ReturnType<typeof getDb>): Promise<SiteSettings> {
	try {
		return await cached(ctx, 'settings:site', 300, () => readSiteSettings(db));
	} catch {
		return { ...DEFAULT_SITE_SETTINGS };
	}
}

async function readSiteSettings(db: ReturnType<typeof getDb>): Promise<SiteSettings> {
	const rows = await db
		.select({ key: settings.key, value: settings.value })
		.from(settings)
		.where(like(settings.key, 'site.%'));
	const map = new Map(rows.map((r) => [r.key, r.value]));
	const result: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

	for (const [field, key] of Object.entries(SIMPLE_KEYS) as [keyof typeof SIMPLE_KEYS, string][]) {
		const raw = map.get(key);
		if (raw !== undefined && raw !== '') result[field] = raw;
	}

	for (const [field, key] of Object.entries(STYLED_KEYS) as [StyledField, string][]) {
		const item: StyledText = { ...result[field] };
		const raw = map.get(key);
		if (raw !== undefined && raw !== '') item.text = raw;
		const color = map.get(`${key}_color`);
		if (color && HEX_COLOR_RE.test(color)) item.color = color.toLowerCase();
		const font = map.get(`${key}_font`);
		if (font && font in FONT_PRESETS) item.font = font;
		result[field] = item;
	}

	const badges = parseJsonArray(map.get(BADGE_KEY));
	if (badges) result.aboutBadges = badges.filter((b) => typeof b === 'string' && b.trim()).map((b) => String(b).trim()).slice(0, 20);
	const timeline = parseJsonArray(map.get(TIMELINE_KEY));
	if (timeline && timeline.every((t) => t && typeof t === 'object')) {
		result.aboutTimeline = timeline
			.map((t) => ({
				date: String((t as TimelineItem).date ?? '').slice(0, 40),
				title: String((t as TimelineItem).title ?? '').slice(0, 120),
				desc: String((t as TimelineItem).desc ?? '').slice(0, 300),
			}))
			.filter((t) => t.title)
			.slice(0, 30);
	}
	return result;
}

function parseJsonArray(raw: string | undefined): unknown[] | undefined {
	if (!raw) return undefined;
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : undefined;
	} catch {
		return undefined;
	}
}

/* ---------- 前台渲染辅助 ---------- */

/** 组装 inline style（颜色 / 字体），无样式时返回 undefined */
export function styledStyle(s: StyledText): string | undefined {
	const parts: string[] = [];
	if (s.color) parts.push(`color:${s.color}`);
	if (s.font && FONT_PRESETS[s.font]) parts.push(`font-family:${FONT_PRESETS[s.font].stack}`);
	return parts.length ? parts.join(';') : undefined;
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** 单段多行文案：转义后换行转 <br /> */
export function renderMultiline(s: StyledText): string {
	return escapeHtml(s.text).replace(/\n/g, '<br />');
}

/** 关于页段落渲染：转义 HTML → **粗体** → {name} 占位替换 → 换行转 <br /> */
export function renderAboutParagraph(text: string, name: string): string {
	return escapeHtml(text)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replaceAll('{name}', name)
		.replace(/\n/g, '<br />');
}

/* ---------- 保存校验与序列化 ---------- */

export type NormalizeResult = { ok: true; value: SiteSettings } | { ok: false; error: string };

const STYLED_REQUIRED: { field: StyledField; label: string; max: number }[] = [
	{ field: 'heroGreeting', label: '问候语', max: 100 },
	{ field: 'heroName', label: '站长名称', max: 60 },
	{ field: 'heroTaglineLight', label: '浅色主题口号', max: 100 },
	{ field: 'heroTaglineDark', label: '暗色主题口号', max: 100 },
	{ field: 'heroBio', label: '首页简介', max: 2000 },
	{ field: 'aboutRole', label: '身份标语', max: 200 },
	{ field: 'aboutBio', label: '关于页简介', max: 10000 },
	{ field: 'aboutContactTitle', label: '联系标题', max: 200 },
	{ field: 'aboutContactDesc', label: '联系描述', max: 1000 },
];

/** 图片类设置：可为空；非空时必须是 http(s) 或站内 /media/ 开头的 URL */
const OPTIONAL_IMAGE_FIELDS: { field: 'siteLogo' | 'ownerAvatar'; label: string }[] = [
	{ field: 'siteLogo', label: '站点 Logo' },
	{ field: 'ownerAvatar', label: '站长头像' },
];

/** 兼容旧客户端的纯字符串输入 → StyledText */
function toStyled(raw: unknown): { text: string; color: string; font: string } {
	if (typeof raw === 'string') return { text: raw, color: '', font: '' };
	const obj = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
	return {
		text: typeof obj.text === 'string' ? obj.text : '',
		color: typeof obj.color === 'string' ? obj.color : '',
		font: typeof obj.font === 'string' ? obj.font : '',
	};
}

/** 保存前校验与规范化：失败返回错误信息 */
export function normalizeSiteSettings(input: unknown): NormalizeResult {
	const obj = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
	const value: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

	const siteTitle = typeof obj.siteTitle === 'string' ? obj.siteTitle.trim() : '';
	if (!siteTitle) return { ok: false, error: '「站点标题」不能为空' };
	value.siteTitle = siteTitle.slice(0, 100);

	for (const { field, label, max } of STYLED_REQUIRED) {
		const raw = toStyled(obj[field]);
		const text = raw.text.trim();
		if (!text) return { ok: false, error: `「${label}」不能为空` };
		const color = raw.color.trim();
		if (color && !HEX_COLOR_RE.test(color)) {
			return { ok: false, error: `「${label}」颜色格式不正确（需 #RRGGBB）` };
		}
		const font = raw.font.trim();
		if (font && !(font in FONT_PRESETS)) {
			return { ok: false, error: `「${label}」字体不受支持` };
		}
		value[field] = { text: text.slice(0, max), color: color ? color.toLowerCase() : '', font };
	}

	for (const { field, label } of OPTIONAL_IMAGE_FIELDS) {
		const raw = obj[field];
		const url = typeof raw === 'string' ? raw.trim() : '';
		if (url && !/^(https?:\/\/|\/media\/)/.test(url)) {
			return { ok: false, error: `「${label}」需要是 http(s) 链接或本站 /media/ 路径` };
		}
		value[field] = url.slice(0, 500);
	}

	const email = typeof obj.aboutContactEmail === 'string' ? obj.aboutContactEmail.trim() : '';
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return { ok: false, error: '联系邮箱格式不正确' };
	}
	value.aboutContactEmail = email.slice(0, 200);

	// 标签：兼容数组或逗号分隔字符串
	const badgesRaw = obj.aboutBadges;
	let badges: string[] = [];
	if (Array.isArray(badgesRaw)) {
		badges = badgesRaw.map((b) => String(b ?? '').trim()).filter(Boolean);
	} else if (typeof badgesRaw === 'string' && badgesRaw.trim()) {
		badges = badgesRaw.split(/[，,]/).map((b) => b.trim()).filter(Boolean);
	}
	value.aboutBadges = badges.slice(0, 20);

	// 时间线：date/title/desc，title 为空整行丢弃
	const timelineRaw = obj.aboutTimeline;
	if (Array.isArray(timelineRaw)) {
		value.aboutTimeline = timelineRaw
			.map((t) => {
				const item = (typeof t === 'object' && t !== null ? t : {}) as Record<string, unknown>;
				return {
					date: String(item.date ?? '').trim().slice(0, 40),
					title: String(item.title ?? '').trim().slice(0, 120),
					desc: String(item.desc ?? '').trim().slice(0, 300),
				};
			})
			.filter((t) => t.title)
			.slice(0, 30);
	}

	return { ok: true, value };
}

/** 序列化为 settings 表行（批量 upsert 用；空 color/font 也写行以便覆盖旧值） */
export function serializeSettings(s: SiteSettings): { key: string; value: string }[] {
	const rows: { key: string; value: string }[] = [
		{ key: 'site.title', value: s.siteTitle },
		{ key: SIMPLE_KEYS.siteLogo, value: s.siteLogo },
		{ key: SIMPLE_KEYS.ownerAvatar, value: s.ownerAvatar },
	];
	for (const [field, key] of Object.entries(STYLED_KEYS) as [StyledField, string][]) {
		rows.push({ key, value: s[field].text });
		rows.push({ key: `${key}_color`, value: s[field].color });
		rows.push({ key: `${key}_font`, value: s[field].font });
	}
	rows.push({ key: BADGE_KEY, value: JSON.stringify(s.aboutBadges) });
	rows.push({ key: TIMELINE_KEY, value: JSON.stringify(s.aboutTimeline) });
	return rows;
}
