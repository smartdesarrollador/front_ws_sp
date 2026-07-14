import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockNote = {
  id: 'n-1',
  title: 'Nota de prueba',
  content: 'Contenido',
  category: null,
  tags: [],
  is_pinned: false,
  is_shared: false,
  shared_by_name: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export const notesHandlers = [
  http.get(`${API}/app/notes/`, () =>
    HttpResponse.json({
      notes: [mockNote],
      pagination: { page: 1, per_page: 20, total: 1 },
    }),
  ),

  http.post(`${API}/app/notes/`, () => HttpResponse.json(mockNote, { status: 201 })),

  http.patch(`${API}/app/notes/:id/`, () => HttpResponse.json(mockNote)),

  http.delete(`${API}/app/notes/:id/`, () => new HttpResponse(null, { status: 204 })),
]
