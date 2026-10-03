import { encryptSessionToken, getStateCookie, sessionCookie, stateCookie } from '../_lib/session.js';

function backToWorkspace(request, message) {
  const url = new URL('/workspace', request.url);
  if (message) url.searchParams.set('github', message);
  return Response.redirect(url, 302);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  if (!returnedState || returnedState !== getStateCookie(request)) return backToWorkspace(request, 'state-error');
  if (!code || !env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET || !env.GITHUB_SESSION_SECRET) {
    return backToWorkspace(request, 'auth-error');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_OAUTH_CLIENT_ID, client_secret: env.GITHUB_OAUTH_CLIENT_SECRET, code }),
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) return backToWorkspace(request, 'auth-error');

    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || null,
      expires_at: data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : null,
    };
    const encrypted = await encryptSessionToken(session, env.GITHUB_SESSION_SECRET);
    const headers = new Headers({ 'Cache-Control': 'no-store' });
    headers.append('Set-Cookie', sessionCookie(encrypted));
    headers.append('Set-Cookie', stateCookie('', 0));
    headers.set('Location', new URL('/workspace?github=connected', request.url).toString());
    return new Response(null, { status: 302, headers });
  } catch {
    return backToWorkspace(request, 'auth-error');
  }
}
