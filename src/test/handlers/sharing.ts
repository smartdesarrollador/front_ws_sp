import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const sharingHandlers = [
  http.get(`${API}/app/sharing/shared-with-me/`, () =>
    HttpResponse.json({ results: [], count: 0 }),
  ),
]
