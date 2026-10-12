export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxy(request, context) {
  const { path = [] } = await context.params;
  const baseUrl = (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '');
  const incomingUrl = new URL(request.url);
  const targetUrl = `${baseUrl}/v1/${path.map((part) => encodeURIComponent(part)).join('/')}${incomingUrl.search}`;
  const headers = new Headers();
  for (const key of ['accept', 'authorization', 'content-type']) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }

  const init = { method: request.method, headers, cache: 'no-store' };
  if (!['GET', 'HEAD'].includes(request.method)) init.body = await request.arrayBuffer();

  try {
    const upstream = await fetch(targetUrl, init);
    const responseHeaders = new Headers();
    for (const key of ['content-type', 'cache-control']) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    responseHeaders.set('cache-control', 'no-store');
    return new Response(request.method === 'HEAD' ? null : await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch (_error) {
    return Response.json({
      error: { code: 'API_UPSTREAM_UNAVAILABLE', message: 'Backend API tidak dapat dijangkau.' }
    }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
