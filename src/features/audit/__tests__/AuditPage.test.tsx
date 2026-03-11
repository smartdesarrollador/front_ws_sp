import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuditPage from '../AuditPage'

// Mock IntersectionObserver as a class — only audit tests need it
globalThis.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  constructor(_cb: unknown, _opts?: unknown) {}
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: number[] = []
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

vi.mock('@/hooks/usePermissions')
vi.mock('../hooks/useAuditLogs')

import { usePermissions } from '@/hooks/usePermissions'
import { useAuditLogs } from '../hooks/useAuditLogs'

const mockLog1 = {
  id: 'log-1',
  action: 'create',
  resource_type: 'project',
  resource_id: 'abc123def456',
  user_email: 'alice@example.com',
  user_name: 'Alice Smith',
  ip_address: '192.168.1.1',
  created_at: '2026-03-03T10:00:00Z',
}

const mockLog2 = {
  id: 'log-2',
  action: 'delete',
  resource_type: 'task',
  resource_id: 'def789ghi012',
  user_email: undefined,
  user_name: undefined,
  ip_address: '10.0.0.1',
  created_at: '2026-03-03T11:00:00Z',
}

const mockPermissionsAll = {
  hasPermission: () => true,
  hasRole: () => false,
  isOwner: false,
  isAdmin: false,
  getPrimaryRole: () => 'Member',
  getRoleColor: () => '#6b7280',
  tenant: null,
}

const mockAuditLogsDefault = {
  logs: [],
  data: undefined,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/audit', element: <AuditPage /> }], {
    initialEntries: ['/audit'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('AuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAll)
    vi.mocked(useAuditLogs).mockReturnValue(mockAuditLogsDefault)
  })

  it('renders heading "Log de Auditoría"', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Log de Auditoría' })).toBeInTheDocument()
  })

  it('shows audit log entries with action and resource_type', () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      ...mockAuditLogsDefault,
      logs: [mockLog1, mockLog2],
      data: {
        pages: [
          {
            logs: [mockLog1, mockLog2],
            pagination: { page: 1, per_page: 25, total: 2, total_pages: 1 },
          },
        ],
        pageParams: [1],
      },
    })

    renderPage()

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Sistema')).toBeInTheDocument()
    expect(screen.getByText('create')).toBeInTheDocument()
    expect(screen.getByText('delete')).toBeInTheDocument()
    expect(screen.getByText('project')).toBeInTheDocument()
    expect(screen.getByText('task')).toBeInTheDocument()
  })

  it('shows "Sin permiso" when hasPermission returns false', () => {
    vi.mocked(usePermissions).mockReturnValue({
      ...mockPermissionsAll,
      hasPermission: () => false,
    })

    renderPage()

    expect(screen.getByText(/sin permiso de acceso/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('shows skeleton rows when isLoading', () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      ...mockAuditLogsDefault,
      isLoading: true,
    })
    const { container } = renderPage()
    expect(container.querySelectorAll('tr.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows empty state when no logs', () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      ...mockAuditLogsDefault,
      logs: [],
      isLoading: false,
    })
    renderPage()
    expect(screen.getByText('No hay registros de auditoría')).toBeInTheDocument()
  })

  it('"Limpiar filtros" button appears when filters active', () => {
    renderPage()
    // Initially no "Limpiar filtros"
    expect(screen.queryByText('Limpiar filtros')).not.toBeInTheDocument()

    // Select an action filter
    const select = screen.getByRole('combobox', { name: /acción/i })
    fireEvent.change(select, { target: { value: 'create' } })

    expect(screen.getByText('Limpiar filtros')).toBeInTheDocument()
  })
})
