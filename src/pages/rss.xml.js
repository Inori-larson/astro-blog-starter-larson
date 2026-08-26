import rss from '@astrojs/rss';
import { getDb } from '../lib/db';
import { cached } from '../lib/cache';
import { listPosts } from '../lib/posts';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const prerender = false;

export async function GET(context) {
	const db = getDb(context);
	const posts = await cached(context, 'posts:list', 300, () => listPosts(db));
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: post.publishedAt,
			categories: post.tags,
			link: `/blog/${post.slug}/`,
		})),
	});
}
