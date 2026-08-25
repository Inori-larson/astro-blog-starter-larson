/** 估算阅读时长（分钟）：中文按 400 字/分钟，其他语言按 200 词/分钟 */
export function readingTimeMinutes(text: string): number {
	const cjkChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) ?? []).length;
	const latinWords = text
		.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.round(cjkChars / 400 + latinWords / 200));
}
