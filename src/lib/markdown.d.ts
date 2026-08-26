/** 共享 Markdown 渲染器类型声明（实现在 markdown.mjs） */
export interface Heading {
	depth: number;
	slug: string;
	text: string;
}

export declare function renderMarkdown(source: string): Promise<{ html: string; headings: Heading[] }>;
export declare function stripMarkdown(mdText: string): string;
export declare function readingTimeMinutes(text: string): number;
