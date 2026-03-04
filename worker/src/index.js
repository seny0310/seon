import { crew, listMissions, listResults } from './store.js';
import { runMissionFlow } from './router.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }));

    if (url.pathname === '/api/crew' && request.method === 'GET') {
      return json(crew);
    }

    if (url.pathname === '/api/missions' && request.method === 'GET') {
      return json(listMissions());
    }

    if (url.pathname === '/api/results' && request.method === 'GET') {
      return json(listResults());
    }

    if (url.pathname === '/api/mission/start' && request.method === 'POST') {
      const body = await request.json();
      const idea = body?.idea?.trim();
      if (!idea) return json({ error: 'idea is required' }, 400);

      const payload = await runMissionFlow(idea, env);
      return json(payload);
    }

    return withCors(new Response('Not found', { status: 404 }));
  }
};

function json(data, status = 200) {
  return withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  );
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return new Response(response.body, { status: response.status, headers });
}
