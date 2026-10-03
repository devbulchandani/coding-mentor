export async function onRequest({ request, env }) {
    const source = new URL(request.url);
    source.pathname = `/mcp/repo${source.pathname.slice('/mcp/repo'.length)}`;
    return proxyRequest(request, source, env.APP_ORIGIN);
}

async function proxyRequest(request, source, origin) {
    if (!origin) {
        return new Response('Backend is not configured', { status: 503 });
    }
    const target = new URL(source.pathname + source.search, origin);
    target.pathname = '/mcp/repo';
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('origin');
    return fetch(new Request(target, { method: request.method, headers, body: request.body, redirect: 'manual' }));
}
