import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockEvent = {
  id: 'e-1',
  title: 'Reunión',
  start_date: '2026-03-15T10:00:00Z',
  end_date: '2026-03-15T11:00:00Z',
  all_day: false,
}

export const calendarHandlers = [
  http.get(`${API}/app/calendar/`, () =>
    HttpResponse.json({ results: [mockEvent], count: 1 }),
  ),

  http.post(`${API}/app/calendar/`, () => HttpResponse.json(mockEvent, { status: 201 })),

  http.patch(`${API}/app/calendar/:id/`, () => HttpResponse.json(mockEvent)),

  http.delete(`${API}/app/calendar/:id/`, () => new HttpResponse(null, { status: 204 })),
]
