import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SSLCertsPage from '../SSLCertsPage'

vi.mock('../hooks/useSSLCerts')
vi.mock('../hooks/useCreateSSLCert')
vi.mock('../hooks/useUpdateSSLCert')
vi.mock('../hooks/useDeleteSSLCert')
vi.mock('@/hooks/useFeatureGate')

import { useSSLCerts } from '../hooks/useSSLCerts'
import { useCreateSSLCert } from '../hooks/useCreateSSLCert'
import { useUpdateSSLCert } from '../hooks/useUpdateSSLCert'
import { useDeleteSSLCert } from '../hooks/useDeleteSSLCert'
import { useFeatureGate } from '@/hooks/useFeatureGate'

const mockCerts = [
  {
    id: '1',
    domain: 'acme.com',
    issuer: "Let's Encrypt",
    expires_at: '2027-01-01',
    auto_renew: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    domain: 'staging.acme.com',
    issuer: 'DigiCert',
    expires_at: '2020-01-01',
    auto_renew: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

const mockMutation = { mutate: vi.fn(), isPending: false, error: null }

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/ssl-certs', element: <SSLCertsPage /> }], {
    initialEntries: ['/ssl-certs'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SSLCertsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useSSLCerts).mockReturnValue({
      data: { certs: mockCerts, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useSSLCerts>)

    vi.mocked(useCreateSSLCert).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useCreateSSLCert>,
    )
    vi.mocked(useUpdateSSLCert).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useUpdateSSLCert>,
    )
    vi.mocked(useDeleteSSLCert).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useDeleteSSLCert>,
    )

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockReturnValue(true),
      getLimit: () => 5,
      plan: 'starter',
      isLoading: false,
    } as ReturnType<typeof useFeatureGate>)
  })

  it('renderiza el título', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Certificados SSL' })).toBeInTheDocument()
  })

  it('muestra los dos certificados', () => {
    renderPage()
    expect(screen.getByText('acme.com')).toBeInTheDocument()
    expect(screen.getByText('staging.acme.com')).toBeInTheDocument()
  })

  it('muestra UpgradePrompt cuando feature está desactivada', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockImplementation((feature: string) => feature !== 'ssl_certs'),
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    } as ReturnType<typeof useFeatureGate>)
    renderPage()
    expect(screen.getAllByText(/certificados ssl/i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: 'Certificados SSL' })).not.toBeInTheDocument()
  })

  it('abre modal al hacer click en Nuevo Certificado', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /nuevo certificado/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('abre modal de edición con título correcto', () => {
    renderPage()
    const editButtons = screen.getAllByRole('button', { name: /editar/i })
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar Certificado SSL')).toBeInTheDocument()
  })

  it('muestra banner rojo por certificados expirados', () => {
    renderPage()
    expect(screen.getByText(/certificado.*expirado/i)).toBeInTheDocument()
  })

  it('muestra banner de plan limit cuando total >= limit * 0.8', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockReturnValue(true),
      getLimit: () => 2,
      plan: 'starter',
      isLoading: false,
    } as ReturnType<typeof useFeatureGate>)
    renderPage()
    expect(screen.getByText(/has usado/i)).toBeInTheDocument()
  })

  it('muestra skeleton cuando isLoading es true', () => {
    vi.mocked(useSSLCerts).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useSSLCerts>)
    const { container } = renderPage()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
