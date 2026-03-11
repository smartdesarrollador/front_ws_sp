import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const featuresHandlers = [
  http.get(`${API}/features/`, () =>
    HttpResponse.json({
      plan: 'professional',
      features: {
        analytics: true,
        analytics_trends: true,
        analytics_export: false,
        audit_logs: true,
        env_vars: true,
        ssh_keys: true,
        ssl_certs: true,
        forms: true,
        notes_sharing: true,
        contacts_export: true,
      },
      limits: {
        users: 50,
        projects: null,
        tasks: null,
        notes: null,
      },
    }),
  ),
]
