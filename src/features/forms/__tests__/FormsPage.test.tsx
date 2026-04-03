import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FormsPage from '../FormsPage'

vi.mock('../hooks/useForms')
vi.mock('../hooks/useDeleteForm')
vi.mock('@/hooks/useFeatureGate')
vi.mock('../components/FormModal', () => ({
  default: ({ onClose, form }: { onClose: () => void; form?: { title: string } | null }) => (
    <div role="dialog" aria-modal="true">
      <span>{form ? 'Editar formulario' : 'Nuevo formulario'}</span>
      <button onClick={onClose}>Cerrar</button>
    </div>
  ),
}))
vi.mock('../components/FormResponsesPanel', () => ({
  default: ({ formId, onClose }: { formId: string | null; onClose: () => void }) => (
    <div data-testid="responses-panel" data-form-id={formId ?? ''}>
      <button onClick={onClose}>Cerrar panel</button>
    </div>
  ),
}))

import { useForms } from '../hooks/useForms'
import { useDeleteForm } from '../hooks/useDeleteForm'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import type { Form } from '../types'

const mockForms: Form[] = [
  {
    id: 'f1',
    title: 'Encuesta de satisfacción',
    description: 'Cuéntanos tu experiencia',
    status: 'active',
    questions: [
      { id: 'q1', text: '¿Cómo nos conociste?', type: 'text', required: true, order: 0 },
    ],
    responses_count: 42,
    closes_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'f2',
    title: 'Formulario de contacto',
    description: '',
    status: 'draft',
    questions: [],
    responses_count: 0,
    closes_at: null,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
]

const mockDeleteMutate = vi.fn()

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/forms', element: <FormsPage /> }], {
    initialEntries: ['/forms'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('FormsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useForms).mockReturnValue({
      data: { forms: mockForms, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useForms>)

    vi.mocked(useDeleteForm).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteForm>)

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockReturnValue(true),
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    } as ReturnType<typeof useFeatureGate>)
  })

  it('renderiza el título Formularios', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Formularios' })).toBeInTheDocument()
  })

  it('muestra la lista de formularios con título y conteo de respuestas', () => {
    renderPage()
    expect(screen.getByText('Encuesta de satisfacción')).toBeInTheDocument()
    expect(screen.getByText('Formulario de contacto')).toBeInTheDocument()
    expect(screen.getByText('42 respuestas')).toBeInTheDocument()
  })

  it('muestra UpgradePrompt cuando la feature forms está desactivada', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockImplementation((feature: string) => feature !== 'forms'),
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    } as ReturnType<typeof useFeatureGate>)
    renderPage()
    // UpgradePrompt shown — heading "Formularios" from the page is NOT shown
    expect(screen.queryByRole('heading', { name: 'Formularios' })).not.toBeInTheDocument()
    // UpgradePrompt renders feature name somewhere
    expect(screen.getAllByText(/forms/i).length).toBeGreaterThan(0)
  })

  it('abre modal de creación al hacer click en Nuevo Formulario', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /nuevo formulario/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nuevo formulario')).toBeInTheDocument()
  })

  it('abre modal de edición al hacer click en el botón editar', () => {
    renderPage()
    const editButtons = screen.getAllByRole('button', { name: /editar/i })
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar formulario')).toBeInTheDocument()
  })

  it('abre el panel de respuestas al hacer click en Ver respuestas', () => {
    renderPage()
    const responseButtons = screen.getAllByRole('button', { name: /ver respuestas/i })
    fireEvent.click(responseButtons[0])
    const panel = screen.getByTestId('responses-panel')
    expect(panel.getAttribute('data-form-id')).toBe('f1')
  })

  it('muestra skeleton cuando isLoading es true', () => {
    vi.mocked(useForms).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useForms>)
    const { container } = renderPage()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('muestra estado vacío cuando no hay formularios', () => {
    vi.mocked(useForms).mockReturnValue({
      data: { forms: [], total: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof useForms>)
    renderPage()
    expect(screen.getByText('Sin formularios')).toBeInTheDocument()
  })
})
