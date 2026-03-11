import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const emptyList = { results: [], count: 0 }

export const devopsHandlers = [
  // Env vars
  http.get(`${API}/app/env-vars/`, () => HttpResponse.json(emptyList)),
  http.post(`${API}/app/env-vars/`, () =>
    HttpResponse.json({ id: 'ev-1' }, { status: 201 }),
  ),
  http.patch(`${API}/app/env-vars/:id/`, () => HttpResponse.json({ id: 'ev-1' })),
  http.delete(`${API}/app/env-vars/:id/`, () => new HttpResponse(null, { status: 204 })),

  // SSH keys
  http.get(`${API}/app/ssh-keys/`, () => HttpResponse.json(emptyList)),
  http.post(`${API}/app/ssh-keys/`, () =>
    HttpResponse.json({ id: 'sk-1' }, { status: 201 }),
  ),
  http.patch(`${API}/app/ssh-keys/:id/`, () => HttpResponse.json({ id: 'sk-1' })),
  http.delete(`${API}/app/ssh-keys/:id/`, () => new HttpResponse(null, { status: 204 })),

  // SSL certs
  http.get(`${API}/app/ssl-certs/`, () => HttpResponse.json(emptyList)),
  http.post(`${API}/app/ssl-certs/`, () =>
    HttpResponse.json({ id: 'sc-1' }, { status: 201 }),
  ),
  http.patch(`${API}/app/ssl-certs/:id/`, () => HttpResponse.json({ id: 'sc-1' })),
  http.delete(`${API}/app/ssl-certs/:id/`, () => new HttpResponse(null, { status: 204 })),
]
