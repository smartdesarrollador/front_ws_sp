import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NotesPage from '../NotesPage'
import { useNotes } from '../hooks/useNotes'
import { useCreateNote } from '../hooks/useCreateNote'
import { useUpdateNote } from '../hooks/useUpdateNote'
import { useDeleteNote } from '../hooks/useDeleteNote'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useNoteTagSuggestions } from '../hooks/useNoteTagSuggestions'
import { useCategories } from '../hooks/useCategories'
import type { Note } from '../types'

vi.mock('../hooks/useNotes')
vi.mock('../hooks/useCreateNote')
vi.mock('../hooks/useUpdateNote')
vi.mock('../hooks/useDeleteNote')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')
vi.mock('../hooks/useNoteTagSuggestions')
vi.mock('../hooks/useCategories')
vi.mock('@/features/sharing/components/ShareResourceModal', () => ({
  ShareResourceModal: ({ resources }: { resources: { id: string; title: string }[] }) => (
    <div data-testid="share-modal">{resources.length} recursos a compartir</div>
  ),
}))

const workCategory = { id: 'cat-work', name: 'Trabajo', color: '#3b82f6', notes_count: 2 }
const personalCategory = { id: 'cat-personal', name: 'Personal', color: '#10b981', notes_count: 1 }

const mockNotes: Note[] = [
  {
    id: 'n1',
    title: 'Meeting notes',
    content: 'Content about the meeting with the team',
    category: workCategory,
    tags: ['meeting', 'team'],
    is_pinned: true,
    is_shared: false,
    shared_by_name: null,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'n2',
    title: 'Grocery list',
    content: 'Milk, eggs, bread',
    category: personalCategory,
    tags: [],
    is_pinned: false,
    is_shared: false,
    shared_by_name: null,
    created_at: '2026-03-02T10:00:00Z',
    updated_at: '2026-03-02T10:00:00Z',
  },
  {
    id: 'n3',
    title: 'Project idea',
    content: 'Build a new app',
    category: workCategory,
    tags: ['idea'],
    is_pinned: false,
    is_shared: true,
    shared_by_name: 'Otro Usuario',
    created_at: '2026-03-03T10:00:00Z',
    updated_at: '2026-03-03T10:00:00Z',
  },
]

const mockDeleteMutate = vi.fn()
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

function renderNotesPage(path = '/notes') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/notes', element: <NotesPage /> }], {
    initialEntries: [path],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('NotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useNotes).mockReturnValue({
      data: { notes: mockNotes, pagination: { page: 1, per_page: 20, total: 2 } },
      isLoading: false,
    } as ReturnType<typeof useNotes>)

    vi.mocked(useDeleteNote).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteNote>)

    vi.mocked(useCreateNote).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateNote>)

    vi.mocked(useUpdateNote).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateNote>)

    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        active_tasks: 2,
        total_projects: 1,
        total_notes: 3,
        events_today: 0,
        usage: {
          tasks_active: 2,
          tasks_limit: 50,
          projects: 1,
          projects_limit: 10,
          notes: 3,
          notes_limit: 100,
        },
      },
      isLoading: false,
    })

    vi.mocked(useNoteTagSuggestions).mockReturnValue({
      data: ['meeting', 'team', 'idea'],
      isLoading: false,
    } as ReturnType<typeof useNoteTagSuggestions>)

    vi.mocked(useCategories).mockReturnValue({
      data: [workCategory, personalCategory],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategories>)
  })

  it('renderiza el título de la página', () => {
    renderNotesPage()
    expect(screen.getAllByText('Notas').length).toBeGreaterThan(0)
  })

  it('muestra la sección Notas fijadas cuando hay notas fijadas', () => {
    renderNotesPage()
    expect(screen.getByText('Notas fijadas')).toBeInTheDocument()
    // The pinned note title should appear
    expect(screen.getByText('Meeting notes')).toBeInTheDocument()
  })

  it('muestra el badge "Compartida" solo en notas compartidas', () => {
    renderNotesPage()
    const badges = screen.getAllByText('Compartida')
    expect(badges).toHaveLength(1)
    expect(
      screen.getByTitle('Compartida por Otro Usuario'),
    ).toBeInTheDocument()
  })

  it('el botón Nueva Nota abre el NoteModal', () => {
    renderNotesPage()
    fireEvent.click(screen.getByText('Nueva Nota'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nueva nota')).toBeInTheDocument()
  })

  it('click en Editar nota abre el NoteModal con datos', () => {
    renderNotesPage()
    const editButtons = screen.getAllByLabelText('Editar nota')
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar nota')).toBeInTheDocument()
  })

  it('filtra notas por categoría', () => {
    renderNotesPage()
    const select = screen.getByLabelText('Filtrar por categoría')
    fireEvent.change(select, { target: { value: 'cat-personal' } })
    // Only the personal note should be shown (Grocery list)
    expect(screen.getByText('Grocery list')).toBeInTheDocument()
    expect(screen.queryByText('Project idea')).not.toBeInTheDocument()
  })

  it('filtra notas por etiqueta', () => {
    renderNotesPage()
    const select = screen.getByLabelText('Filtrar por etiqueta')
    fireEvent.change(select, { target: { value: 'idea' } })
    expect(screen.getByText('Project idea')).toBeInTheDocument()
    expect(screen.queryByText('Grocery list')).not.toBeInTheDocument()
  })

  it('filtra notas por búsqueda en título', () => {
    renderNotesPage()
    const searchInput = screen.getByPlaceholderText('Buscar notas...')
    fireEvent.change(searchInput, { target: { value: 'Grocery' } })
    expect(screen.getByText('Grocery list')).toBeInTheDocument()
    expect(screen.queryByText('Project idea')).not.toBeInTheDocument()
  })

  it('el filtro pinned_only oculta la sección Notas fijadas separada', () => {
    renderNotesPage()
    // Pinned section visible before toggle
    expect(screen.getAllByText('Notas fijadas').length).toBeGreaterThan(0)
    // Toggle pinned only
    fireEvent.click(screen.getByText('Solo fijadas'))
    // Now section heading should be 'Notas fijadas' but within the main section only
    // The separate pinned heading should NOT exist (pinned_only hides the separate section)
    // We verify that "Notas fijadas" appears only once (in the main all-notes section header)
    expect(screen.getAllByText('Notas fijadas').length).toBe(1)
  })

  it('muestra banner de plan cuando notas >= 80% del límite', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        active_tasks: 2,
        total_projects: 1,
        total_notes: 82,
        events_today: 0,
        usage: {
          tasks_active: 2,
          tasks_limit: 50,
          projects: 1,
          projects_limit: 10,
          notes: 82,
          notes_limit: 100,
        },
      },
      isLoading: false,
    })

    renderNotesPage()
    expect(screen.getByText(/límite de notas/)).toBeInTheDocument()
  })

  it('muestra skeleton cuando isLoading=true', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useNotes>)

    const { container } = renderNotesPage()
    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
  })

  it('cambia a vista lista al hacer click en Vista lista', () => {
    renderNotesPage()
    const listBtn = screen.getByLabelText('Vista lista')
    fireEvent.click(listBtn)
    expect(listBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('muestra estado vacío cuando no hay notas', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: { notes: [], pagination: { page: 1, per_page: 20, total: 0 } },
      isLoading: false,
    } as unknown as ReturnType<typeof useNotes>)

    renderNotesPage()
    expect(screen.getByText('No hay notas')).toBeInTheDocument()
  })

  it('permite seleccionar varias notas y compartirlas en lote', () => {
    renderNotesPage()

    fireEvent.click(screen.getByText('Seleccionar'))
    fireEvent.click(screen.getByLabelText('Seleccionar Meeting notes'))
    fireEvent.click(screen.getByLabelText('Seleccionar Grocery list'))

    expect(screen.getByText('2 seleccionadas')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))
    expect(screen.getByTestId('share-modal')).toHaveTextContent('2 recursos a compartir')
  })

  it('muestra el paginador cuando hay más de una página de no-fijadas', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: { notes: mockNotes, pagination: { page: 1, per_page: 20, total: 45 } },
      isLoading: false,
    } as ReturnType<typeof useNotes>)

    renderNotesPage()
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
  })

  it('no muestra el paginador cuando "Solo fijadas" está activo', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: { notes: mockNotes, pagination: { page: 1, per_page: 20, total: 45 } },
      isLoading: false,
    } as ReturnType<typeof useNotes>)

    renderNotesPage()
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Solo fijadas'))
    expect(screen.queryByText(/Página \d+ de \d+/)).not.toBeInTheDocument()
  })

  it('al hacer click en Siguiente pide la página siguiente a useNotes', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: { notes: mockNotes, pagination: { page: 1, per_page: 20, total: 45 } },
      isLoading: false,
    } as ReturnType<typeof useNotes>)

    renderNotesPage()
    fireEvent.click(screen.getByLabelText('Página siguiente'))
    expect(useNotes).toHaveBeenLastCalledWith(expect.anything(), 2)
  })

  it('cambiar un filtro resetea la página a 1', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: { notes: mockNotes, pagination: { page: 1, per_page: 20, total: 45 } },
      isLoading: false,
    } as ReturnType<typeof useNotes>)

    renderNotesPage('/notes?page=2')
    expect(useNotes).toHaveBeenLastCalledWith(expect.anything(), 2)

    const searchInput = screen.getByPlaceholderText('Buscar notas...')
    fireEvent.change(searchInput, { target: { value: 'Grocery' } })
    expect(useNotes).toHaveBeenLastCalledWith(expect.anything(), 1)
  })

  it('las notas fijadas siguen completas aunque haya más de 20', () => {
    const manyPinned: Note[] = Array.from({ length: 25 }, (_, i) => ({
      id: `pinned-${i}`,
      title: `Pinned ${i}`,
      content: '',
      category: null,
      tags: [],
      is_pinned: true,
      is_shared: false,
      shared_by_name: null,
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-03-01T10:00:00Z',
    }))

    vi.mocked(useNotes).mockReturnValue({
      data: { notes: manyPinned, pagination: { page: 1, per_page: 20, total: 0 } },
      isLoading: false,
    } as ReturnType<typeof useNotes>)

    renderNotesPage()
    manyPinned.forEach((note) => {
      expect(screen.getByText(note.title)).toBeInTheDocument()
    })
  })
})
