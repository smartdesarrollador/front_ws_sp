import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SearchPage from '../SearchPage'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import type { GlobalSearchResponse } from '../types'

vi.mock('../hooks/useGlobalSearch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useGlobalSearch')>()
  return { ...actual, useGlobalSearch: vi.fn() }
})

const mockResponse: GlobalSearchResponse = {
  query: 'mango',
  total: 2,
  groups: [
    {
      type: 'notes',
      label: 'Notas',
      count: 1,
      results: [
        { type: 'notes', id: 'n1', title: 'Mango note', snippet: 'about mango', url: '/notes', created_at: null },
      ],
    },
    {
      type: 'tasks',
      label: 'Tareas',
      count: 1,
      results: [
        { type: 'tasks', id: 't1', title: 'mango task', snippet: '', url: '/tasks', created_at: null },
      ],
    },
  ],
}

function renderSearchPage(initialEntry = '/search') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/search', element: <SearchPage /> }], {
    initialEntries: [initialEntry],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

function mockSearch(data: GlobalSearchResponse | undefined, opts: Partial<{ isLoading: boolean; isError: boolean }> = {}) {
  vi.mocked(useGlobalSearch).mockReturnValue({
    data,
    isLoading: opts.isLoading ?? false,
    isError: opts.isError ?? false,
  } as unknown as ReturnType<typeof useGlobalSearch>)
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el título de la página', () => {
    mockSearch(undefined)
    renderSearchPage()
    expect(screen.getByRole('heading', { name: 'Buscar' })).toBeInTheDocument()
  })

  it('muestra el hint cuando no hay término de búsqueda', () => {
    mockSearch(undefined)
    renderSearchPage()
    expect(screen.getByText(/Escribe al menos 2 caracteres/i)).toBeInTheDocument()
  })

  it('renderiza grupos y resultados cuando hay coincidencias', () => {
    mockSearch(mockResponse)
    renderSearchPage('/search?q=mango')
    expect(screen.getByRole('heading', { name: 'Notas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tareas' })).toBeInTheDocument()
    // Titles are split across <mark> nodes by the highlighter, so match on the
    // title paragraph's full textContent instead of a single text node.
    const titleByText = (text: string) =>
      screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === text)
    expect(titleByText('Mango note')).toBeInTheDocument()
    expect(titleByText('mango task')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay resultados', () => {
    mockSearch({ query: 'zzz', total: 0, groups: [] })
    renderSearchPage('/search?q=zzz')
    expect(screen.getByText(/No se encontraron resultados/i)).toBeInTheDocument()
  })

  it('muestra el input con el valor inicial de la URL', () => {
    mockSearch(mockResponse)
    renderSearchPage('/search?q=mango')
    expect(screen.getByLabelText('Buscar')).toHaveValue('mango')
  })
})
