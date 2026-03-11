import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SharedWithMePage from '../SharedWithMePage'

vi.mock('../hooks/useSharedWithMe')

import { useSharedWithMe } from '../hooks/useSharedWithMe'
import type { SharedItem } from '../types'

const mockItems: SharedItem[] = [
  {
    id: 'sh-1',
    resource_type: 'project',
    resource_id: 'proj-1',
    resource_name: 'Proyecto Alpha',
    shared_by_name: 'Carlos García',
    shared_by_email: 'carlos@example.com',
    access_level: 'editor',
    message: 'Para que lo revises',
    expires_at: null,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'sh-2',
    resource_type: 'task',
    resource_id: 'task-1',
    resource_name: 'Revisar PR #42',
    shared_by_name: 'Ana López',
    shared_by_email: 'ana@example.com',
    access_level: 'viewer',
    expires_at: '2026-04-01T00:00:00Z',
    created_at: '2026-03-02T00:00:00Z',
  },
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/shared', element: <SharedWithMePage /> }], {
    initialEntries: ['/shared'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SharedWithMePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useSharedWithMe).mockReturnValue({
      data: { items: mockItems, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useSharedWithMe>)
  })

  it('renders heading "Compartido Conmigo"', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Compartido Conmigo' })).toBeInTheDocument()
  })

  it('shows shared items with resource_name and shared_by_name', () => {
    renderPage()
    expect(screen.getByText('Proyecto Alpha')).toBeInTheDocument()
    expect(screen.getByText('Revisar PR #42')).toBeInTheDocument()
    expect(screen.getByText('Carlos García')).toBeInTheDocument()
    expect(screen.getByText('Ana López')).toBeInTheDocument()
  })

  it('shows access level badge for each item', () => {
    renderPage()
    expect(screen.getAllByText('Editor').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Visualizador').length).toBeGreaterThan(0)
  })

  it('filters by resource_type select', () => {
    renderPage()
    const select = screen.getByRole('combobox', { name: /tipo de recurso/i })
    fireEvent.change(select, { target: { value: 'task' } })
    expect(screen.queryByText('Proyecto Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Revisar PR #42')).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    vi.mocked(useSharedWithMe).mockReturnValue({
      data: { items: [] as SharedItem[], total: 0 },
      isLoading: false,
    } as ReturnType<typeof useSharedWithMe>)
    renderPage()
    expect(screen.getByText('Nada compartido contigo aún')).toBeInTheDocument()
  })

  it('shows skeleton cards when isLoading', () => {
    vi.mocked(useSharedWithMe).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useSharedWithMe>)
    const { container } = renderPage()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
