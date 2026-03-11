import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SSHKeysPage from '../SSHKeysPage'
import { useSSHKeys } from '../hooks/useSSHKeys'
import { useCreateSSHKey } from '../hooks/useCreateSSHKey'
import { useUpdateSSHKey } from '../hooks/useUpdateSSHKey'
import { useDeleteSSHKey } from '../hooks/useDeleteSSHKey'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import type { SSHKey } from '../types'

vi.mock('../hooks/useSSHKeys')
vi.mock('../hooks/useCreateSSHKey')
vi.mock('../hooks/useUpdateSSHKey')
vi.mock('../hooks/useDeleteSSHKey')
vi.mock('@/hooks/useFeatureGate')

const mockSSHKeys: SSHKey[] = [
  {
    id: '1',
    name: 'Deploy Key',
    algorithm: 'Ed25519',
    public_key: 'ssh-ed25519 AAAA...',
    fingerprint: 'SHA256:abc123',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Backup Key',
    algorithm: 'RSA',
    public_key: 'ssh-rsa BBBB...',
    fingerprint: 'SHA256:def456',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

const mockDeleteMutate = vi.fn()
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

function renderSSHKeysPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/ssh-keys', element: <SSHKeysPage /> }], {
    initialEntries: ['/ssh-keys'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SSHKeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useSSHKeys).mockReturnValue({
      data: { sshKeys: mockSSHKeys, total: 2 },
      isLoading: false,
    } as ReturnType<typeof useSSHKeys>)

    vi.mocked(useDeleteSSHKey).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteSSHKey>)

    vi.mocked(useCreateSSHKey).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateSSHKey>)

    vi.mocked(useUpdateSSHKey).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateSSHKey>)

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockReturnValue(true),
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })
  })

  it('renderiza el encabezado "Claves SSH"', () => {
    renderSSHKeysPage()
    expect(screen.getByRole('heading', { name: 'Claves SSH' })).toBeInTheDocument()
  })

  it('muestra 2 tarjetas (Deploy Key y Backup Key)', () => {
    renderSSHKeysPage()
    expect(screen.getByText('Deploy Key')).toBeInTheDocument()
    expect(screen.getByText('Backup Key')).toBeInTheDocument()
  })

  it('muestra fallback de FeatureGate cuando hasFeature("ssh_keys") es false', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockImplementation((feature: string) => feature !== 'ssh_keys'),
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })
    renderSSHKeysPage()
    expect(screen.getByText(/Actualizar plan/i)).toBeInTheDocument()
    expect(screen.queryByText('Deploy Key')).not.toBeInTheDocument()
  })

  it('el botón "Nueva Clave SSH" abre el modal', () => {
    renderSSHKeysPage()
    fireEvent.click(screen.getByText('Nueva Clave SSH'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('click en editar abre el modal con "Editar clave SSH"', () => {
    renderSSHKeysPage()
    const editButtons = screen.getAllByLabelText('Editar clave SSH')
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Editar clave SSH')).toBeInTheDocument()
  })

  it('los fingerprints son visibles en las tarjetas', () => {
    renderSSHKeysPage()
    expect(screen.getByText('SHA256:abc123')).toBeInTheDocument()
    expect(screen.getByText('SHA256:def456')).toBeInTheDocument()
  })

  it('muestra banner de límite de plan cuando total >= limit * 0.8', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: vi.fn().mockReturnValue(true),
      // limit = 2, total = 2, 2 >= 2*0.8 = 1.6 → banner shown
      getLimit: () => 2,
      plan: 'starter',
      isLoading: false,
    })
    renderSSHKeysPage()
    expect(screen.getByText(/límite de claves SSH/i)).toBeInTheDocument()
  })

  it('muestra 4 skeletons animate-pulse cuando isLoading=true', () => {
    vi.mocked(useSSHKeys).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useSSHKeys>)

    const { container } = renderSSHKeysPage()
    const skeletonCards = container.querySelectorAll('.animate-pulse')
    expect(skeletonCards.length).toBe(4)
  })
})
