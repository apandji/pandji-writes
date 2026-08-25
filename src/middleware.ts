import { defineMiddleware } from 'astro:middleware';
import { isSignedIn } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const adminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
	const adminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

	if ((adminPage || adminApi) && !isSignedIn(context.cookies)) {
		if (adminApi) {
			return new Response(JSON.stringify({ error: 'unauthorized' }), {
				status: 401,
				headers: { 'content-type': 'application/json' },
			});
		}
		return context.redirect('/admin/login');
	}

	return next();
});
