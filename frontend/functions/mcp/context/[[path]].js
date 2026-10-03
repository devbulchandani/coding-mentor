export async function onRequest({ request, env }) {
    const source = new URL(request.url);
    const planPath = source.pathname.slice('/mcp/context'.length);
    if (!planPath || planPath === '/') {
        return new Response('A plan ID is required', { status: 400 });
    }
    const target = new URL(`/mcp/context${planPath}${source.search}`, env.APP_ORIGIN || 'http://localhost');
    if (!env.APP_ORIGIN) {
        return new Response('Backend is not configured', { status: 503 });
    }
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('origin');
    return fetch(new Request(target, { method: request.method, headers, body: request.body, redirect: 'manual' }));
}
