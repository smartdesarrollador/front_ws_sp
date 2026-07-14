import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockContact = {
  id: 'c-1',
  name: 'Ana López',
  email: 'ana@acme.com',
  company: 'Acme',
  phone: null,
  group: null,
}

export const contactsHandlers = [
  http.get(`${API}/app/contacts/`, () =>
    HttpResponse.json({
      contacts: [mockContact],
      pagination: { page: 1, per_page: 20, total: 1 },
    }),
  ),

  http.post(`${API}/app/contacts/`, () => HttpResponse.json(mockContact, { status: 201 })),

  http.patch(`${API}/app/contacts/:id/`, () => HttpResponse.json(mockContact)),

  http.delete(`${API}/app/contacts/:id/`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/app/contacts/groups/`, () => HttpResponse.json([])),
]
