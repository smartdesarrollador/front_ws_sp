import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SnippetsPage from '../SnippetsPage'
import { useSnippets } from '../hooks/useSnippets'
import { useCreateSnippet } from '../hooks/useCreateSnippet'
import { useUpdateSnippet } from '../hooks/useUpdateSnippet'
import { useDeleteSnippet } from '../hooks/useDeleteSnippet'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import type { CodeSnippet } from '../types'

vi.mock('../hooks/useSnippets')
vi.mock('../hooks/useCreateSnippet')
vi.mock('../hooks/useUpdateSnippet')
vi.mock('../hooks/useDeleteSnippet')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')
vi.mock('@/hooks/useFeatureGate')

const mockSnippets: CodeSnippet[] = [
  {
    id: 's1',
    title: 'useEffect cleanup',
    description: 'Cleanup pattern',
    code: 'useEffect(() => { return () => {} }, [])',
    language: 'typescript',
    tags: ['react', 'hooks'],
    is_favorite: true,
    usage_count: 5,
    is_shared: false,
    shared_by_name: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 's2',
    title: 'Python hello world',
    description: 'Basic Python',
    code: 'print("Hello, World!")',
    language: 'python',
    tags: ['python', 'basics'],
    is_favorite: false,
    usage_count: 1,
    is_shared: true,
    shared_by_name: 'Otro Usuario',
    created_at: '2026-01-02',
    updated_at: '2026-01-02',
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
    bookmarks: 5,
    bookmarks_limit: 50,
    snippets: 5,
    snippets_limit: 50,
  },
}

function renderSnippetsPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/snippets', element: <SnippetsPage /> }], {
    initialEntries: ['/snippets'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SnippetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useSnippets).mockReturnValue({
      data: { snippets: mockSnippets, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useSnippets>)

    vi.mocked(useDeleteSnippet).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSnippet>)

    vi.mocked(useCreateSnippet).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateSnippet>)

    vi.mocked(useUpdateSnippet).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateSnippet>)

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
    renderSnippetsPage()
    expect(screen.getByText('Snippets')).toBeInTheDocument()
  })

  it('muestra snippets en grid', () => {
    renderSnippetsPage()
    expect(screen.getByText('useEffect cleanup')).toBeInTheDocument()
    expect(screen.getByText('Python hello world')).toBeInTheDocument()
  })

  it('muestra el badge "Compartido" solo en snippets compartidos', () => {
    renderSnippetsPage()
    expect(screen.getAllByText('Compartido')).toHaveLength(1)
    expect(screen.getByTitle('Compartido por Otro Usuario')).toBeInTheDocument()
  })

  it('el botón Nuevo Snippet abre el SnippetModal', () => {
    renderSnippetsPage()
    fireEvent.click(screen.getByText('Nuevo Snippet'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nuevo snippet')).toBeInTheDocument()
  })

  it('click en Editar abre el modal con datos', () => {
    renderSnippetsPage()
    const editButtons = screen.getAllByLabelText('Editar snippet')
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar snippet')).toBeInTheDocument()
  })

  it('filtra por búsqueda en título', () => {
    renderSnippetsPage()
    const searchInput = screen.getByPlaceholderText('Buscar snippets...')
    fireEvent.change(searchInput, { target: { value: 'useEffect' } })
    expect(screen.getByText('useEffect cleanup')).toBeInTheDocument()
    expect(screen.queryByText('Python hello world')).not.toBeInTheDocument()
  })

  it('filtra por código', () => {
    renderSnippetsPage()
    const searchInput = screen.getByPlaceholderText('Buscar snippets...')
    fireEvent.change(searchInput, { target: { value: 'Hello, World' } })
    expect(screen.getByText('Python hello world')).toBeInTheDocument()
    expect(screen.queryByText('useEffect cleanup')).not.toBeInTheDocument()
  })

  it('muestra banner plan cuando snippets >= 80% del límite', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        ...defaultSummaryData,
        usage: {
          ...defaultSummaryData.usage,
          snippets: 18,
          snippets_limit: 20,
        },
      },
      isLoading: false,
    })

    renderSnippetsPage()
    expect(screen.getByText(/límite.*de snippets/)).toBeInTheDocument()
  })

  it('muestra skeleton cuando isLoading=true', () => {
    vi.mocked(useSnippets).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useSnippets>)

    const { container } = renderSnippetsPage()
    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
  })

  it('muestra estado vacío cuando no hay snippets', () => {
    vi.mocked(useSnippets).mockReturnValue({
      data: { snippets: [], total: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof useSnippets>)

    renderSnippetsPage()
    expect(screen.getByText('No hay snippets')).toBeInTheDocument()
  })

  it('Export muestra fallback disabled cuando no tiene feature snippets_export', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => false,
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })

    renderSnippetsPage()
    const exportBtn = screen.getByRole('button', { name: /Exportar/i })
    expect(exportBtn).toBeDisabled()
  })
})
