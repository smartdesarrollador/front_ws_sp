import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

const mockShare = {
  id: 'share-1',
  resource_type: 'snippet',
  resource_id: 'snippet-1',
  shared_by_email: 'owner@corp.com',
  shared_with_email: 'alice@corp.com',
  shared_with_name: 'Alice',
  permission_level: 'viewer',
  is_inherited: false,
  expires_at: null,
  created_at: '2026-01-01T00:00:00Z',
}

export const sharingHandlers = [
  // shared-with-me MUST be before the generic GET /app/sharing/ to avoid MSW prefix matching
  http.get(`${API}/app/sharing/shared-with-me/`, () =>
    HttpResponse.json({
      items: [
        {
          id: 'sh-1',
          resource_type: 'snippet',
          resource_id: 'snippet-1',
          resource_name: 'My Snippet',
          shared_by_name: 'Owner',
          shared_by_email: 'owner@corp.com',
          shared_with_email: 'alice@corp.com',
          shared_with_name: 'Alice',
          permission_level: 'viewer',
          access_level: 'viewer',
          is_inherited: false,
          expires_at: null,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      total: 1,
    }),
  ),

  // List shares for a resource
  http.get(`${API}/app/sharing/`, () => HttpResponse.json({ shares: [mockShare] })),

  // Create a share
  http.post(`${API}/app/sharing/`, () =>
    HttpResponse.json({ share: mockShare }, { status: 201 }),
  ),

  // Revoke a share
  http.delete(`${API}/app/sharing/:shareId/delete/`, () =>
    new HttpResponse(null, { status: 204 }),
  ),
]
