import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const notificationsHandlers = [
  http.get(`${API}/app/notifications/`, () =>
    HttpResponse.json({ notifications: [], unread_count: 0 }),
  ),

  http.post(`${API}/app/notifications/:id/read/`, () => HttpResponse.json({})),

  http.post(`${API}/app/notifications/read-all/`, () => HttpResponse.json({})),
]
