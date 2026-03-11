import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockTicket = {
  id: 'tkt-1',
  subject: 'Problema',
  status: 'open',
  priority: 'media',
  created_at: '2026-01-01T00:00:00Z',
}

export const supportHandlers = [
  http.get(`${API}/support/tickets/`, () =>
    HttpResponse.json({ results: [], count: 0 }),
  ),

  http.get(`${API}/support/tickets/:id/`, () => HttpResponse.json(mockTicket)),

  http.post(`${API}/support/tickets/`, () =>
    HttpResponse.json(mockTicket, { status: 201 }),
  ),

  http.post(`${API}/support/tickets/:id/comments/`, () =>
    HttpResponse.json({
      id: 'cmt-1',
      body: 'Reply',
      role: 'client',
      created_at: '2026-01-01T00:00:00Z',
    }, { status: 201 }),
  ),
]
