import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                lazy: () =>
                  import('@/pages/DashboardPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'tasks',
                lazy: () =>
                  import('@/pages/TasksPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'calendar',
                lazy: () =>
                  import('@/pages/CalendarPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'notes',
                lazy: () =>
                  import('@/pages/NotesPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'contacts',
                lazy: () =>
                  import('@/pages/ContactsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'bookmarks',
                lazy: () =>
                  import('@/pages/BookmarksPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'snippets',
                lazy: () =>
                  import('@/pages/SnippetsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'projects',
                lazy: () =>
                  import('@/pages/ProjectsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'env-vars',
                lazy: () =>
                  import('@/pages/EnvVarsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'ssh-keys',
                lazy: () =>
                  import('@/pages/SSHKeysPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'ssl-certs',
                lazy: () =>
                  import('@/pages/SSLCertsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'forms',
                lazy: () =>
                  import('@/pages/FormsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'shared',
                lazy: () =>
                  import('@/pages/SharedWithMePage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'audit',
                lazy: () =>
                  import('@/pages/AuditPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'reports',
                lazy: () =>
                  import('@/pages/ReportsPage').then((m) => ({ Component: m.default })),
              },
            ],
          },
        ],
      },
      {
        path: 'login',
        lazy: () =>
          import('@/features/auth/LoginPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'forgot-password',
        lazy: () =>
          import('@/features/auth/ForgotPasswordPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reset-password',
        lazy: () =>
          import('@/features/auth/ResetPasswordPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'sso/callback',
        lazy: () =>
          import('@/features/auth/SSOCallbackPage').then((m) => ({ Component: m.default })),
      },
    ],
  },
])
