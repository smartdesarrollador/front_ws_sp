import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ContactsPage from '../ContactsPage'
import { useContacts } from '../hooks/useContacts'
import { useContactGroups } from '../hooks/useContactGroups'
import { useCreateContact } from '../hooks/useCreateContact'
import { useUpdateContact } from '../hooks/useUpdateContact'
import { useDeleteContact } from '../hooks/useDeleteContact'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import type { Contact, ContactGroup } from '../types'

vi.mock('../hooks/useContacts')
vi.mock('../hooks/useContactGroups')
vi.mock('../hooks/useCreateContact')
vi.mock('../hooks/useUpdateContact')
vi.mock('../hooks/useDeleteContact')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')
vi.mock('@/hooks/useFeatureGate')

const mockGroups: ContactGroup[] = [
  { id: 'g1', name: 'Clientes', color: '#3B82F6', contacts_count: 2 },
  { id: 'g2', name: 'Proveedores', color: '#10B981', contacts_count: 1 },
]

const mockContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Ana García',
    email: 'ana@empresa.com',
    phone: '+34 600 123 456',
    company: 'Empresa S.A.',
    job_title: 'Directora',
    group: mockGroups[0],
    notes: 'Contacto principal',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Carlos Ruiz',
    email: 'carlos@proveedor.com',
    company: 'Proveedor SL',
    job_title: 'Comercial',
    group: mockGroups[1],
    created_at: '2026-03-02T10:00:00Z',
    updated_at: '2026-03-02T10:00:00Z',
  },
]

const mockDeleteMutate = vi.fn()
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

const defaultSummaryData = {
  active_tasks: 2,
  total_projects: 1,
  total_notes: 5,
  events_today: 0,
  usage: {
    tasks_active: 2,
    tasks_limit: 50,
    projects: 1,
    projects_limit: 10,
    notes: 5,
    notes_limit: 100,
    contacts: 2,
    contacts_limit: 100,
  },
}

function renderContactsPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/contacts', element: <ContactsPage /> }], {
    initialEntries: ['/contacts'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('ContactsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useContacts).mockReturnValue({
      data: { contacts: mockContacts, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useContacts>)

    vi.mocked(useContactGroups).mockReturnValue({
      data: mockGroups,
      isLoading: false,
    } as unknown as ReturnType<typeof useContactGroups>)

    vi.mocked(useDeleteContact).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteContact>)

    vi.mocked(useCreateContact).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateContact>)

    vi.mocked(useUpdateContact).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateContact>)

    vi.mocked(useDashboardSummary).mockReturnValue({
      data: defaultSummaryData,
      isLoading: false,
    })

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })
  })

  it('renderiza el título de la página', () => {
    renderContactsPage()
    expect(screen.getByText('Contactos')).toBeInTheDocument()
  })

  it('muestra contactos en grid', () => {
    renderContactsPage()
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
  })

  it('el botón Nuevo Contacto abre el ContactModal', () => {
    renderContactsPage()
    fireEvent.click(screen.getByText('Nuevo Contacto'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nuevo contacto')).toBeInTheDocument()
  })

  it('click en Editar abre el modal con datos', () => {
    renderContactsPage()
    const editButtons = screen.getAllByLabelText('Editar contacto')
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar contacto')).toBeInTheDocument()
  })

  it('filtra por búsqueda en nombre', () => {
    renderContactsPage()
    const searchInput = screen.getByPlaceholderText('Buscar contactos...')
    fireEvent.change(searchInput, { target: { value: 'Ana' } })
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Ruiz')).not.toBeInTheDocument()
  })

  it('filtra por empresa', () => {
    renderContactsPage()
    const searchInput = screen.getByPlaceholderText('Buscar contactos...')
    fireEvent.change(searchInput, { target: { value: 'Proveedor' } })
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument()
  })

  it('muestra banner plan cuando contacts >= 80% del límite', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        ...defaultSummaryData,
        usage: {
          ...defaultSummaryData.usage,
          contacts: 85,
          contacts_limit: 100,
        },
      },
      isLoading: false,
    })

    renderContactsPage()
    expect(screen.getByText(/límite de contactos/)).toBeInTheDocument()
  })

  it('muestra skeleton cuando isLoading=true', () => {
    vi.mocked(useContacts).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useContacts>)

    const { container } = renderContactsPage()
    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
  })

  it('muestra estado vacío cuando no hay contactos', () => {
    vi.mocked(useContacts).mockReturnValue({
      data: { contacts: [], total: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof useContacts>)

    renderContactsPage()
    expect(screen.getByText('No hay contactos')).toBeInTheDocument()
  })

  it('CSV Export muestra UpgradePrompt cuando no tiene feature contacts_export', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => false,
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })

    renderContactsPage()
    const exportBtn = screen.getByRole('button', { name: /Exportar CSV/i })
    expect(exportBtn).toBeDisabled()
  })
})
