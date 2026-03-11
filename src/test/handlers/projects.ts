import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockProject = {
  id: 'p-1',
  name: 'Mi Proyecto',
  description: '',
  color: '#2563eb',
  sections_count: 0,
  items_count: 0,
}

const mockItem = {
  id: 'i-1',
  name: 'Item de prueba',
  project: 'p-1',
  section: 'sec-1',
  created_at: '2026-01-01T00:00:00Z',
}

const mockField = {
  id: 'f-1',
  name: 'Campo secreto',
  value: '***',
  is_encrypted: true,
  created_at: '2026-01-01T00:00:00Z',
}

export const projectsHandlers = [
  http.get(`${API}/app/projects/`, () => HttpResponse.json([mockProject])),

  http.post(`${API}/app/projects/`, () => HttpResponse.json(mockProject, { status: 201 })),

  http.get(`${API}/app/projects/:id/`, () =>
    HttpResponse.json({ ...mockProject, sections: [] }),
  ),

  http.patch(`${API}/app/projects/:id/`, () => HttpResponse.json(mockProject)),

  http.delete(`${API}/app/projects/:id/`, () => new HttpResponse(null, { status: 204 })),

  // Sections
  http.post(`${API}/app/projects/:id/sections/`, () =>
    HttpResponse.json({ id: 'sec-1', name: 'Sección', items: [] }, { status: 201 }),
  ),

  http.patch(`${API}/app/projects/:id/sections/:sk/`, () =>
    HttpResponse.json({ id: 'sec-1', name: 'Sección', items: [] }),
  ),

  http.delete(`${API}/app/projects/:id/sections/:sk/`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Items
  http.post(`${API}/app/projects/:id/items/`, () =>
    HttpResponse.json(mockItem, { status: 201 }),
  ),

  http.patch(`${API}/app/projects/:id/items/:ik/`, () => HttpResponse.json(mockItem)),

  http.delete(`${API}/app/projects/:id/items/:ik/`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Fields
  http.get(`${API}/app/projects/:id/items/:ik/fields/`, () => HttpResponse.json([])),

  http.post(`${API}/app/projects/:id/items/:ik/fields/`, () =>
    HttpResponse.json(mockField, { status: 201 }),
  ),

  http.patch(`${API}/app/projects/:id/items/:ik/fields/:fk/`, () =>
    HttpResponse.json(mockField),
  ),

  http.delete(`${API}/app/projects/:id/items/:ik/fields/:fk/`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Reveal
  http.post(`${API}/app/projects/:id/items/:ik/fields/:fk/reveal/`, () =>
    HttpResponse.json({ value: 'secret-value' }),
  ),

  // Members
  http.get(`${API}/app/projects/:id/members/`, () => HttpResponse.json([])),

  http.post(`${API}/app/projects/:id/members/`, () =>
    HttpResponse.json({ id: 'm-1' }, { status: 201 }),
  ),

  http.delete(`${API}/app/projects/:id/members/`, () =>
    new HttpResponse(null, { status: 204 }),
  ),
]
