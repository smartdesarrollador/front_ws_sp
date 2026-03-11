import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SupportPage from '../SupportPage'

vi.mock('../hooks/useTickets')
vi.mock('../hooks/useCreateTicket')
vi.mock('../hooks/useTicketDetail', () => ({
  useTicketDetail: () => ({ ticket: null, isLoading: false }),
}))
vi.mock('../hooks/useAddComment', () => ({
  useAddComment: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'es', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

import { useTickets } from '../hooks/useTickets'
import { useCreateTicket } from '../hooks/useCreateTicket'
import type { SupportTicket } from '../types'

const mockTickets: SupportTicket[] = [
  {
    id: '1',
    reference: 'TKT-001',
    subject: 'Error en facturación',
    description: 'Desc',
    category: 'billing',
    priority: 'alta',
    status: 'open',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    reference: 'TKT-002',
    subject: 'No puedo acceder',
    description: 'Desc',
    category: 'technical',
    priority: 'urgente',
    status: 'open',
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
  {
    id: '3',
    reference: 'TKT-003',
    subject: 'Consulta general',
    description: 'Desc',
    category: 'general',
    priority: 'baja',
    status: 'resolved',
    created_at: '2026-01-03T00:00:00Z',
    updated_at: '2026-01-03T00:00:00Z',
  },
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/support', element: <SupportPage /> }], {
    initialEntries: ['/support'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SupportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useTickets).mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
    })

    vi.mocked(useCreateTicket).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateTicket>)
  })

  it('renders heading "Soporte"', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Soporte' })).toBeInTheDocument()
  })

  it('shows ticket subjects', () => {
    renderPage()
    expect(screen.getByText('Error en facturación')).toBeInTheDocument()
    expect(screen.getByText('No puedo acceder')).toBeInTheDocument()
    expect(screen.getByText('Consulta general')).toBeInTheDocument()
  })

  it('opens NewTicketModal on button click', () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /Nuevo ticket/i })
    fireEvent.click(btn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('filters tickets by status', () => {
    renderPage()
    const select = screen.getByRole('combobox', { name: /Estado/i })
    fireEvent.change(select, { target: { value: 'open' } })
    // Resolved ticket should no longer be visible
    expect(screen.queryByText('Consulta general')).not.toBeInTheDocument()
    // Open tickets should remain
    expect(screen.getByText('Error en facturación')).toBeInTheDocument()
    expect(screen.getByText('No puedo acceder')).toBeInTheDocument()
  })
})
