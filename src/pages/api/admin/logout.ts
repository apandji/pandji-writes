export const prerender = false;

import type { APIRoute } from 'astro';
import { clearSessionCookie, isSameOrigin } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	if (!isSameOrigin(request)) {
		return new Response('forbidden', { status: 403 });
	}

	clearSessionCookie(cookies);
	return redirect('/admin/login');
};
