import rss from '@astrojs/rss';
import { getDb } from '../lib/db';
import { cached } from '../lib/cache';
import { listPosts } from '../lib/posts';
import { getSiteSettings } from '../lib/settings';
import { SITE_DESCRIPTION } from '../consts';

export const prerender = false;

export async function GET(context) {
	const db = getDb(context);
	const [posts, site] = await Promise.all([
		cached(context, 'posts:list', 300, () => listPosts(db)),
		getSiteSettings(context, db),
	]);
	return rss({
		title: site.siteTitle,
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
