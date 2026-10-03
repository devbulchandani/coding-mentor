export async function onRequest({ request, env }) {
    return proxyRequest(request, env.APP_ORIGIN);
}

async function proxyRequest(request, origin) {
    if (!origin) {
        return new Response('Backend is not configured', { status: 503 });
    }

    const source = new URL(request.url);
    const target = new URL(source.pathname + source.search, origin);
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('origin');

    return fetch(new Request(target, { method: request.method, headers, body: request.body, redirect: 'manual' }));
}
