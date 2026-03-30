/**
 * Cloudflare Worker — IC Assistant Chatbot Proxy
 * 
 * This worker securely proxies requests from the Meta IC Engagement Guide
 * to the Groq API. The API key is stored as a Cloudflare Worker Secret
 * (never exposed in the browser or page source).
 *
 * Deploy steps:
 *   1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Paste this entire file into the editor and click "Deploy"
 *   3. Go to Settings → Variables → Add a Secret named GROQ_API_KEY
 *      with your Groq API key as the value
 *   4. Copy the Worker URL (e.g. https://ic-chat-proxy.YOUR-SUBDOMAIN.workers.dev)
 *      and paste it into index.html where indicated
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Allowed origin — restrict to your GitHub Pages domain for security
const ALLOWED_ORIGIN = 'https://meta-ic-program.github.io';

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Only allow requests from the guide site
    const origin = request.headers.get('Origin') || '';
    if (origin !== ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const body = await request.json();

      // Forward to Groq using the secret API key (never exposed to browser)
      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await groqResponse.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Proxy error', detail: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      });
    }
  },
};
