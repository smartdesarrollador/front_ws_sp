import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const emptyList = { results: [], count: 0 }

export const formsHandlers = [
  http.get(`${API}/app/forms/`, () => HttpResponse.json(emptyList)),

  http.post(`${API}/app/forms/`, () =>
    HttpResponse.json({ id: 'form-1' }, { status: 201 }),
  ),

  http.get(`${API}/app/forms/:id/`, () =>
    HttpResponse.json({ id: 'form-1', title: 'Formulario', fields: [] }),
  ),

  http.patch(`${API}/app/forms/:id/`, () =>
    HttpResponse.json({ id: 'form-1', title: 'Formulario', fields: [] }),
  ),

  http.delete(`${API}/app/forms/:id/`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/app/forms/:id/responses/`, () => HttpResponse.json(emptyList)),
]
