import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NotificationsPage from '../NotificationsPage'

vi.mock('../hooks/useNotifications')
vi.mock('../hooks/useMarkAsRead')
vi.mock('../hooks/useMarkAllAsRead', () => ({
  useMarkAllAsRead: () => ({ mutate: vi.fn(), isPending: false }),
}))

import { useNotifications } from '../hooks/useNotifications'
import { useMarkAsRead } from '../hooks/useMarkAsRead'
import type { AppNotification } from '../types'

const mockNotifications: AppNotification[] = [
  {
    id: 'n-1',
    category: 'tasks',
    title: 'Tarea asignada',
    message: 'Se te asignó una nueva tarea',
    read: false,
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'n-2',
    category: 'security',
    title: 'Inicio de sesión',
    message: 'Nuevo inicio de sesión detectado',
    read: false,
    created_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'n-3',
    category: 'billing',
    title: 'Factura generada',
    message: 'Tu factura de marzo está lista',
    read: true,
    created_at: '2026-03-09T08:00:00Z',
  },
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/notifications', element: <NotificationsPage /> }], {
    initialEntries: ['/notifications'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('NotificationsPage', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      isLoading: false,
    })

    vi.mocked(useMarkAsRead).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useMarkAsRead>)
  })

  it('renders heading "Notificaciones"', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Notificaciones' })).toBeInTheDocument()
  })

  it('shows unread badge counter', () => {
    renderPage()
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
  })

  it('filters to unread only when "Sin leer" is clicked', () => {
    renderPage()
    const unreadBtn = screen.getByRole('button', { name: /Sin leer/i })
    fireEvent.click(unreadBtn)
    // The read notification should not be visible
    expect(screen.queryByText('Factura generada')).not.toBeInTheDocument()
    // The unread ones should be visible
    expect(screen.getByText('Tarea asignada')).toBeInTheDocument()
    expect(screen.getByText('Inicio de sesión')).toBeInTheDocument()
  })

  it('calls markAsRead.mutate with notification id when "Marcar como leída" is clicked', () => {
    renderPage()
    const buttons = screen.getAllByText('Marcar como leída')
    fireEvent.click(buttons[0])
    expect(mockMutate).toHaveBeenCalledWith('n-1')
  })
})
