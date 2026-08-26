/**
 * 邮件发送（Resend API，免费额度 100 封/天）
 * 环境变量：RESEND_API_KEY、MAIL_FROM（如 "Larson's Blog <noreply@larson.it.com>"）
 * 未配置时所有发送静默跳过（开发环境不报错）
 */

interface MailEnv {
	RESEND_API_KEY?: string;
	MAIL_FROM?: string;
}

export interface SendResult {
	ok: boolean;
	error?: string;
}

async function send(env: MailEnv, to: string, subject: string, html: string): Promise<SendResult> {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) return { ok: false, error: 'RESEND_API_KEY 未配置（邮件已跳过）' };
	const from = env.MAIL_FROM || 'Larson\'s Blog <onboarding@resend.dev>';

	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ from, to, subject, html }),
		});
		if (!res.ok) {
			const text = await res.text();
			return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` };
		}
		return { ok: true };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	}
}

/** 邮件外壳：与站点双世界观呼应的简洁模板 */
function layout(title: string, bodyHtml: string, siteUrl: string): string {
	return `<!doctype html>
<html lang="zh-CN">
<body style="margin:0;padding:0;background:#f0f7fd;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;">
	<div style="max-width:560px;margin:32px auto;padding:32px 28px;background:#ffffff;border-radius:16px;border:1px solid #c8dff0;">
		<div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
			<span style="display:inline-flex;width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#1d5fb8,#3b82f6);color:#fff;align-items:center;justify-content:center;font-weight:700;">L</span>
			<span style="font-weight:700;color:#173a56;font-size:15px;">Larson's Blog</span>
		</div>
		<h1 style="margin:0 0 16px;font-size:20px;color:#173a56;">${title}</h1>
		<div style="font-size:14px;line-height:1.9;color:#33526e;">${bodyHtml}</div>
		<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e1effb;font-size:11px;color:#93a9bd;">
			此邮件由 <a href="${siteUrl}" style="color:#1d5fb8;">Larson's Blog</a> 发送 · 如果这不是你的操作，请忽略
		</div>
	</div>
</body>
</html>`;
}

const SITE_URL = 'https://blog.larson.it.com';

/** 订阅确认邮件 */
export async function sendSubscribeConfirm(env: MailEnv, to: string, token: string): Promise<SendResult> {
	const link = `${SITE_URL}/subscribe/verify?token=${token}`;
	return send(
		env,
		to,
		'确认订阅 Larson\'s Blog',
		layout(
			'确认你的订阅',
			`<p>你好！点击下方按钮确认订阅，之后新文章发布时会第一时间通知你：</p>
			<p style="margin:24px 0;"><a href="${link}" style="display:inline-block;padding:12px 28px;background:linear-gradient(90deg,#1d5fb8,#3b82f6);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">确认订阅</a></p>
			<p style="font-size:12px;color:#93a9bd;">按钮无效？直接访问：<br><a href="${link}" style="color:#1d5fb8;word-break:break-all;">${link}</a><br>链接 24 小时内有效。</p>`,
			SITE_URL,
		),
	);
}

/** 新文章通知邮件 */
export async function sendNewPost(
	env: MailEnv,
	to: string,
	post: { title: string; description: string; slug: string },
): Promise<SendResult> {
	const link = `${SITE_URL}/blog/${post.slug}/`;
	return send(
		env,
		to,
		`新文章：${post.title}`,
		layout(
			'新文章发布啦',
			`<p>${post.description || '点击下方链接阅读全文。'}</p>
			<p style="margin:24px 0;"><a href="${link}" style="display:inline-block;padding:12px 28px;background:linear-gradient(90deg,#1d5fb8,#3b82f6);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">${post.title}</a></p>
			<p style="font-size:12px;color:#93a9bd;"><a href="${link}" style="color:#1d5fb8;word-break:break-all;">${link}</a></p>`,
			SITE_URL,
		),
	);
}
