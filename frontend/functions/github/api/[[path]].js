import { encryptSessionToken, getSession, sessionCookie } from '../_lib/session.js';

const allowedPath = /^\/(?:user(?:\/repos)?|repos\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/(?:branches\/.*|git\/(?:blobs|trees|commits|ref|refs)(?:\/.*)?))?)$/;
const allowedMethods = new Set(['GET', 'POST', 'PATCH']);

export async function onRequest({ request, env, params }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  if (!allowedMethods.has(request.method)) return new Response('Method not allowed', { status: 405 });

  const path = `/${Array.isArray(params.path) ? params.path.join('/') : params.path || ''}`;
  if (!allowedPath.test(path)) return new Response('Not found', { status: 404 });
  const session = await getSession(request, env.GITHUB_SESSION_SECRET || '');
  if (!session?.access_token) return Response.json({ message: 'Connect your GitHub account to continue.' }, { status: 401 });

  let token = session.access_token;
  let refreshedCookie = null;
  if (session.refresh_token && session.expires_at && session.expires_at - Date.now() < 60_000) {
    const refreshResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_OAUTH_CLIENT_ID, client_secret: env.GITHUB_OAUTH_CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: session.refresh_token }),
    });
    const refreshed = await refreshResponse.json();
    if (!refreshResponse.ok || !refreshed.access_token) return Response.json({ message: 'Your GitHub connection expired. Please reconnect GitHub.' }, { status: 401 });
    token = refreshed.access_token;
    const encrypted = await encryptSessionToken({
      access_token: token,
      refresh_token: refreshed.refresh_token || session.refresh_token,
      expires_at: refreshed.expires_in ? Date.now() + Number(refreshed.expires_in) * 1000 : null,
    }, env.GITHUB_SESSION_SECRET);
    refreshedCookie = sessionCookie(encrypted);
  }

  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 5_000_000) return Response.json({ message: 'This request is too large.' }, { status: 413 });
  const requestBody = request.method === 'GET' ? undefined : await request.arrayBuffer();
  if (requestBody && requestBody.byteLength > 5_000_000) return Response.json({ message: 'This request is too large.' }, { status: 413 });

  const target = new URL(`https://api.github.com${path}${new URL(request.url).search}`);
  const headers = new Headers({
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Buildspace-Learning-Workspace',
  });
  if (request.headers.has('Content-Type')) headers.set('Content-Type', request.headers.get('Content-Type'));
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: requestBody,
  });
  const responseHeaders = new Headers({
    'Content-Type': response.headers.get('Content-Type') || 'application/json',
    'Cache-Control': 'no-store',
  });
  if (refreshedCookie) responseHeaders.append('Set-Cookie', refreshedCookie);
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
