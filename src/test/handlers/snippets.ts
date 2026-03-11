import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockSnippet = {
  id: 's-1',
  title: 'Hello World',
  language: 'python',
  code: 'print("hello")',
  tags: [],
}

export const snippetsHandlers = [
  http.get(`${API}/app/snippets/`, () =>
    HttpResponse.json({ results: [mockSnippet], count: 1 }),
  ),

  http.post(`${API}/app/snippets/`, () => HttpResponse.json(mockSnippet, { status: 201 })),

  http.patch(`${API}/app/snippets/:id/`, () => HttpResponse.json(mockSnippet)),

  http.delete(`${API}/app/snippets/:id/`, () => new HttpResponse(null, { status: 204 })),
]
