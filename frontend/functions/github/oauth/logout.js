import { sessionCookie } from '../_lib/session.js';

export async function onRequestPost({ request }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  return new Response(null, { status: 204, headers: { 'Set-Cookie': sessionCookie('', 0), 'Cache-Control': 'no-store' } });
}
