import { stateCookie } from '../_lib/session.js';

export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET || !env.GITHUB_SESSION_SECRET) {
    return Response.redirect(new URL('/workspace?github=setup-required', request.url), 302);
  }

  const state = crypto.randomUUID();
  const callback = new URL('/github/oauth/callback', request.url).toString();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', callback);
  authorize.searchParams.set('scope', 'repo');
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': stateCookie(state),
    },
  });
}
