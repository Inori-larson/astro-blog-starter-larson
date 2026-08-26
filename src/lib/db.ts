import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export function getDb(astro: { locals: App.Locals }) {
	const { DB } = astro.locals.runtime.env;
	return drizzle(DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
export { schema };
