import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockUser = {
  id: 'user-1',
  email: 'user@acme.com',
  first_name: 'Juan',
  last_name: 'García',
  is_active: true,
  email_verified: true,
  permissions: ['audit.view_auditlog'],
  roles: ['Member'],
  mfa_enabled: false,
  last_login: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockTenant = {
  id: 'tenant-1',
  name: 'Acme Corp',
  slug: 'acme',
  subdomain: 'acme',
  plan: 'professional',
}

export const authHandlers = [
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: mockUser,
      tenant: mockTenant,
    }),
  ),

  http.post(`${API}/auth/refresh-token`, () =>
    HttpResponse.json({
      access_token: 'refreshed',
      refresh_token: 'refreshed',
    }),
  ),

  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${API}/auth/sso/validate`, () =>
    HttpResponse.json({
      access_token: 'sso-access-token',
      refresh_token: 'sso-refresh-token',
      user: mockUser,
      tenant: mockTenant,
    }),
  ),

  http.patch(`${API}/auth/profile/`, () => HttpResponse.json({ ...mockUser })),

  http.post(`${API}/auth/change-password/`, () => HttpResponse.json({})),

  http.post(`${API}/auth/mfa/enable/`, () =>
    HttpResponse.json({ qr_uri: 'otpauth://totp/test', secret: 'ABCDEF' }),
  ),

  http.post(`${API}/auth/mfa/disable/`, () => HttpResponse.json({})),

  http.post(`${API}/auth/forgot-password`, () => HttpResponse.json({})),

  http.post(`${API}/auth/reset-password`, () => HttpResponse.json({})),
]
