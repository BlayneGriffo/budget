// Cloudflare Pages Function: Up Bank API proxy
// Avoids CORS by proxying requests through Cloudflare's edge
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.searchParams.get('path');

  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Up-Token',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  const token = request.headers.get('X-Up-Token');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing X-Up-Token header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const upUrl = 'https://api.up.com.au/api/v1' + path;
    const upResp = await fetch(upUrl, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });

    const body = await upResp.text();
    return new Response(body, {
      status: upResp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
