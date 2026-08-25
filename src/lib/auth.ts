import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

const COOKIE = 'pw_admin';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret() {
	const value = import.meta.env.SESSION_SECRET || process.env.SESSION_SECRET;
	if (!value) {
		throw new Error('SESSION_SECRET is not set');
	}
	return value;
}

function sign(value: string) {
	return createHmac('sha256', secret()).update(value).digest('base64url');
}

function equal(left: string, right: string) {
	const a = Buffer.from(left);
	const b = Buffer.from(right);
	if (a.length !== b.length) {
		timingSafeEqual(a, Buffer.alloc(a.length));
		return false;
	}
	return timingSafeEqual(a, b);
}

export function hasValidCredentials(username: string, password: string) {
	const expectedUser = import.meta.env.ADMIN_USERNAME || process.env.ADMIN_USERNAME || '';
	const expectedPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
	if (!expectedUser || !expectedPass) return false;
	return equal(username, expectedUser) && equal(password, expectedPass);
}

export function createSessionCookie(cookies: AstroCookies) {
	const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
	const payload = String(expires);
	const value = `${payload}.${sign(payload)}`;
	cookies.set(COOKIE, value, {
		httpOnly: true,
		sameSite: 'lax',
		secure: import.meta.env.PROD,
		path: '/',
		maxAge: MAX_AGE_SECONDS,
	});
}

export function clearSessionCookie(cookies: AstroCookies) {
	cookies.delete(COOKIE, { path: '/' });
}

export function isSignedIn(cookies: AstroCookies) {
	const raw = cookies.get(COOKIE)?.value;
	if (!raw) return false;
	const [payload, signature] = raw.split('.');
	if (!payload || !signature) return false;
	if (!equal(signature, sign(payload))) return false;
	const expires = Number(payload);
	return Number.isFinite(expires) && expires > Date.now() / 1000;
}

export function isSameOrigin(request: Request) {
	const url = new URL(request.url);
	const origin = request.headers.get('origin');
	if (origin) return origin === url.origin;
	const referer = request.headers.get('referer');
	if (!referer) return false;
	try {
		return new URL(referer).origin === url.origin;
	} catch {
		return false;
	}
}
