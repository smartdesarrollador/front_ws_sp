import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockBookmark = {
  id: 'b-1',
  title: 'Google',
  url: 'https://google.com',
  collection: null,
  tags: [],
}

export const bookmarksHandlers = [
  http.get(`${API}/app/bookmarks/`, () =>
    HttpResponse.json({ results: [mockBookmark], count: 1 }),
  ),

  http.post(`${API}/app/bookmarks/`, () => HttpResponse.json(mockBookmark, { status: 201 })),

  http.patch(`${API}/app/bookmarks/:id/`, () => HttpResponse.json(mockBookmark)),

  http.delete(`${API}/app/bookmarks/:id/`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/app/bookmarks/collections/`, () => HttpResponse.json([])),
]
