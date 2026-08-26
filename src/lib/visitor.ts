/**
 * 访客指纹：IP + UA 的 SHA-256（截断），用于点赞去重与限流
 * 不可逆，不存储原始 IP
 */
export async function visitorHash(request: Request): Promise<string> {
	const ip =
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'0.0.0.0';
	const ua = request.headers.get('user-agent') ?? '';
	const data = new TextEncoder().encode(`${ip}:${ua}`);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** IP 哈希（评论存储用，粒度更粗） */
export async function ipHash(request: Request): Promise<string> {
	const ip =
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'0.0.0.0';
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
	return [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}
