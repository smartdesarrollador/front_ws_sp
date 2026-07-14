import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockTask = {
  id: 't-1',
  title: 'Tarea de prueba',
  status: 'todo',
  priority: 'media',
  due_date: null,
  created_at: '2026-01-01T00:00:00Z',
}

export const tasksHandlers = [
  http.get(`${API}/app/tasks/`, () =>
    HttpResponse.json({
      tasks: [mockTask],
      pagination: { page: 1, per_page: 20, total: 1 },
    }),
  ),

  http.post(`${API}/app/tasks/`, () => HttpResponse.json(mockTask, { status: 201 })),

  http.patch(`${API}/app/tasks/:id/`, () => HttpResponse.json(mockTask)),

  http.delete(`${API}/app/tasks/:id/`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${API}/app/tasks/:id/comments/`, () =>
    HttpResponse.json({
      id: 'c-1',
      body: 'Comment',
      created_at: '2026-01-01T00:00:00Z',
    }, { status: 201 }),
  ),
]
