import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EnvVarsPage from '../EnvVarsPage'
import { useEnvVars } from '../hooks/useEnvVars'
import { useCreateEnvVar } from '../hooks/useCreateEnvVar'
import { useUpdateEnvVar } from '../hooks/useUpdateEnvVar'
import { useDeleteEnvVar } from '../hooks/useDeleteEnvVar'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import type { EnvVariable } from '../types'

vi.mock('../hooks/useEnvVars')
vi.mock('../hooks/useCreateEnvVar')
vi.mock('../hooks/useUpdateEnvVar')
vi.mock('../hooks/useDeleteEnvVar')
vi.mock('@/hooks/useFeatureGate')

const mockEnvVars: EnvVariable[] = [
  {
    id: '1',
    key: 'DATABASE_URL',
    value: 'postgres://secret',
    description: 'DB connection',
    environment: 'production',
    is_encrypted: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    key: 'API_KEY',
    value: 'sk-123456',
    description: 'API key',
    environment: 'staging',
    is_encrypted: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

const mockDeleteMutate = vi.fn()
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

function renderEnvVarsPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/env-vars', element: <EnvVarsPage /> }], {
    initialEntries: ['/env-vars'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('EnvVarsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useEnvVars).mockReturnValue({
      data: { envVars: mockEnvVars, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useEnvVars>)

    vi.mocked(useDeleteEnvVar).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteEnvVar>)

    vi.mocked(useCreateEnvVar).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateEnvVar>)

    vi.mocked(useUpdateEnvVar).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateEnvVar>)

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockReturnValue(true),
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })
  })

  it('renderiza el título de la página', () => {
    renderEnvVarsPage()
    expect(screen.getByRole('heading', { name: 'Variables de Entorno' })).toBeInTheDocument()
  })

  it('muestra 2 variables en la tabla (DATABASE_URL y API_KEY visibles)', () => {
    renderEnvVarsPage()
    expect(screen.getByText('DATABASE_URL')).toBeInTheDocument()
    expect(screen.getByText('API_KEY')).toBeInTheDocument()
  })

  it('muestra fallback de FeatureGate cuando hasFeature("env_vars") es false', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockImplementation((feature: string) => feature !== 'env_vars'),
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })
    renderEnvVarsPage()
    expect(screen.getByText(/Actualizar plan/i)).toBeInTheDocument()
    expect(screen.queryByText('DATABASE_URL')).not.toBeInTheDocument()
  })

  it('el botón "Nueva Variable" abre el EnvVarModal', () => {
    renderEnvVarsPage()
    fireEvent.click(screen.getByText('Nueva Variable'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('click en editar abre el modal con texto "Editar variable"', () => {
    renderEnvVarsPage()
    const editButtons = screen.getAllByLabelText('Editar variable')
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar variable')).toBeInTheDocument()
  })

  it('el valor cifrado se muestra como "••••••••" por defecto', () => {
    renderEnvVarsPage()
    const maskedValues = screen.getAllByText('••••••••')
    expect(maskedValues.length).toBeGreaterThan(0)
  })

  it('click en revelar muestra el valor real', () => {
    renderEnvVarsPage()
    // Both rows have a reveal button; click the first one (DATABASE_URL)
    const revealButtons = screen.getAllByLabelText('Revelar')
    fireEvent.click(revealButtons[0])
    expect(screen.getByText('postgres://secret')).toBeInTheDocument()
  })

  it('muestra skeleton (5 filas animate-pulse) cuando isLoading=true', () => {
    vi.mocked(useEnvVars).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useEnvVars>)

    const { container } = renderEnvVarsPage()
    const skeletonRows = container.querySelectorAll('tr.animate-pulse')
    expect(skeletonRows.length).toBe(5)
  })
})
