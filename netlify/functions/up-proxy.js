// netlify/functions/up-proxy.js
// Proxies requests to the Up Bank API to avoid CORS restrictions in the browser

exports.handler = async function(event) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Up-Token',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // Get the Up token from the request header
  const upToken = event.headers['x-up-token'];
  if (!upToken) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing Up Bank token' })
    };
  }

  // Get the path to forward (e.g. /transactions?filter[status]=SETTLED&...)
  const path = event.queryStringParameters && event.queryStringParameters.path
    ? event.queryStringParameters.path
    : '/util/ping';

  const upUrl = 'https://api.up.com.au/api/v1' + path;

  try {
    const response = await fetch(upUrl, {
      headers: {
        'Authorization': 'Bearer ' + upToken,
        'Accept': 'application/json',
      }
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
      body: data
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
