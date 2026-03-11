import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const reportsHandlers = [
  http.get(`${API}/app/reports/summary/`, () =>
    HttpResponse.json({
      tasks_active: 5,
      projects: 2,
      notes: 10,
      events_today: 1,
    }),
  ),

  http.get(`${API}/app/reports/usage/`, () =>
    HttpResponse.json({ role_distribution: [], top_permissions: [] }),
  ),

  http.get(`${API}/app/reports/trends/`, () =>
    HttpResponse.json({ period: '30d', data: [] }),
  ),

  http.get(`${API}/admin/audit-logs/`, () =>
    HttpResponse.json({ results: [], count: 0, next: null, previous: null }),
  ),
]
