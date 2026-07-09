import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BookmarksPage from '../BookmarksPage'
import { useBookmarks } from '../hooks/useBookmarks'
import { useCollections } from '../hooks/useCollections'
import { useCreateBookmark } from '../hooks/useCreateBookmark'
import { useUpdateBookmark } from '../hooks/useUpdateBookmark'
import { useDeleteBookmark } from '../hooks/useDeleteBookmark'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useBookmarkTagSuggestions } from '../hooks/useBookmarkTagSuggestions'
import type { Bookmark, BookmarkCollection } from '../types'

vi.mock('../hooks/useBookmarks')
vi.mock('../hooks/useCollections')
vi.mock('../hooks/useCreateBookmark')
vi.mock('../hooks/useUpdateBookmark')
vi.mock('../hooks/useDeleteBookmark')
vi.mock('@/features/dashboard/hooks/useDashboardSummary')
vi.mock('@/hooks/useFeatureGate')
vi.mock('../hooks/useBookmarkTagSuggestions')

const mockCollections: BookmarkCollection[] = [
  { id: 'c1', name: 'Dev', color: '#3B82F6', bookmarks_count: 2 },
  { id: 'c2', name: 'Diseño', color: '#10B981', bookmarks_count: 1 },
]

const mockBookmarks: Bookmark[] = [
  {
    id: 'b1',
    title: 'React Docs',
    url: 'https://react.dev',
    description: 'Official docs',
    collection: { id: 'c1', name: 'Dev', color: '#3B82F6', bookmarks_count: 2 },
    tags: ['react', 'docs'],
    favicon: null,
    is_favorite: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'b2',
    title: 'Vite Guide',
    url: 'https://vitejs.dev',
    description: 'Vite bundler',
    collection: null,
    tags: ['vite', 'build'],
    favicon: null,
    is_favorite: false,
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
  },
}

function renderBookmarksPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/bookmarks', element: <BookmarksPage /> }], {
    initialEntries: ['/bookmarks'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('BookmarksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useBookmarks).mockReturnValue({
      data: { bookmarks: mockBookmarks, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useBookmarks>)

    vi.mocked(useCollections).mockReturnValue({
      data: mockCollections,
      isLoading: false,
    } as unknown as ReturnType<typeof useCollections>)

    vi.mocked(useDeleteBookmark).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteBookmark>)

    vi.mocked(useCreateBookmark).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateBookmark>)

    vi.mocked(useUpdateBookmark).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateBookmark>)

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

    vi.mocked(useBookmarkTagSuggestions).mockReturnValue({
      data: ['react', 'docs', 'vite', 'build'],
      isLoading: false,
    } as ReturnType<typeof useBookmarkTagSuggestions>)
  })

  it('renderiza el título de la página', () => {
    renderBookmarksPage()
    expect(screen.getByText('Bookmarks')).toBeInTheDocument()
  })

  it('muestra bookmarks en grid', () => {
    renderBookmarksPage()
    expect(screen.getByText('React Docs')).toBeInTheDocument()
    expect(screen.getByText('Vite Guide')).toBeInTheDocument()
  })

  it('el botón Nuevo Bookmark abre el BookmarkModal', () => {
    renderBookmarksPage()
    fireEvent.click(screen.getByText('Nuevo Bookmark'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nuevo bookmark')).toBeInTheDocument()
  })

  it('click en Editar abre el modal con datos', () => {
    renderBookmarksPage()
    const editButtons = screen.getAllByLabelText('Editar bookmark')
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar bookmark')).toBeInTheDocument()
  })

  it('filtra por búsqueda en título', () => {
    renderBookmarksPage()
    const searchInput = screen.getByPlaceholderText('Buscar bookmarks...')
    fireEvent.change(searchInput, { target: { value: 'React' } })
    expect(screen.getByText('React Docs')).toBeInTheDocument()
    expect(screen.queryByText('Vite Guide')).not.toBeInTheDocument()
  })

  it('filtra por URL', () => {
    renderBookmarksPage()
    const searchInput = screen.getByPlaceholderText('Buscar bookmarks...')
    fireEvent.change(searchInput, { target: { value: 'vitejs' } })
    expect(screen.getByText('Vite Guide')).toBeInTheDocument()
    expect(screen.queryByText('React Docs')).not.toBeInTheDocument()
  })

  it('filtra bookmarks por etiqueta', () => {
    renderBookmarksPage()
    const select = screen.getByLabelText('Filtrar por etiqueta')
    fireEvent.change(select, { target: { value: 'vite' } })
    expect(screen.getByText('Vite Guide')).toBeInTheDocument()
    expect(screen.queryByText('React Docs')).not.toBeInTheDocument()
  })

  it('muestra banner plan cuando bookmarks >= 80% del límite', () => {
    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        ...defaultSummaryData,
        usage: {
          ...defaultSummaryData.usage,
          bookmarks: 18,
          bookmarks_limit: 20,
        },
      },
      isLoading: false,
    })

    renderBookmarksPage()
    expect(screen.getByText(/límite.*de bookmarks/)).toBeInTheDocument()
  })

  it('muestra skeleton cuando isLoading=true', () => {
    vi.mocked(useBookmarks).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useBookmarks>)

    const { container } = renderBookmarksPage()
    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
  })

  it('muestra estado vacío cuando no hay bookmarks', () => {
    vi.mocked(useBookmarks).mockReturnValue({
      data: { bookmarks: [], total: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof useBookmarks>)

    renderBookmarksPage()
    expect(screen.getByText('No hay bookmarks')).toBeInTheDocument()
  })

  it('Export muestra fallback disabled cuando no tiene feature bookmarks_export', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => false,
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })

    renderBookmarksPage()
    const exportBtn = screen.getByRole('button', { name: /Exportar/i })
    expect(exportBtn).toBeDisabled()
  })
})
