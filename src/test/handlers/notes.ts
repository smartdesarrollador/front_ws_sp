import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockNote = {
  id: 'n-1',
  title: 'Nota de prueba',
  content: 'Contenido',
  category: 'work',
  pinned: false,
  created_at: '2026-01-01T00:00:00Z',
}

export const notesHandlers = [
  http.get(`${API}/app/notes/`, () =>
    HttpResponse.json({ results: [mockNote], count: 1 }),
  ),

  http.post(`${API}/app/notes/`, () => HttpResponse.json(mockNote, { status: 201 })),

  http.patch(`${API}/app/notes/:id/`, () => HttpResponse.json(mockNote)),

  http.delete(`${API}/app/notes/:id/`, () => new HttpResponse(null, { status: 204 })),
]
