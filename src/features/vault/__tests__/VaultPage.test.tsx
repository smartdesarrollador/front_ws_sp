import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VaultPage from '../VaultPage'
import { useVaultStatus } from '../hooks/useVaultStatus'
import { useVaultItems } from '../hooks/useVaultItems'
import { useLockVault } from '../hooks/useLockVault'
import { useUnlockVault } from '../hooks/useUnlockVault'
import { useRevealVaultItem, useDeleteVaultItem } from '../hooks/useVaultItemMutations'
import {
  useSharedVaultItems,
  useRevealSharedVaultItem,
  useItemShares,
  useShareVaultItem,
  useRevokeVaultShare,
} from '../hooks/useVaultSharing'
import { useTeamDirectory } from '@/features/sharing/hooks/useTeamDirectory'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useVaultStore } from '@/store/vaultStore'
import type { SharedVaultItem, VaultItem } from '../types'

vi.mock('../hooks/useVaultStatus')
vi.mock('../hooks/useVaultItems')
vi.mock('../hooks/useLockVault')
vi.mock('../hooks/useUnlockVault')
vi.mock('../hooks/useVaultItemMutations')
vi.mock('../hooks/useVaultSharing')
vi.mock('@/features/sharing/hooks/useTeamDirectory')
vi.mock('@/hooks/useFeatureGate')

const mockItems: VaultItem[] = [
  { id: '1', title: 'GitHub', item_type: 'login', favorite: false, created_at: '2026-01-01', updated_at: '2026-01-01' },
]

const mockSharedItems: SharedVaultItem[] = [
  {
    share_id: 'sh-1',
    item_id: 'item-2',
    title: 'Shared Login',
    item_type: 'login',
    shared_by_name: 'Otro Usuario',
    created_at: '2026-01-02',
  },
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/vault', element: <VaultPage /> }], {
    initialEntries: ['/vault'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

function setStatus(is_configured: boolean) {
  vi.mocked(useVaultStatus).mockReturnValue({
    data: { is_configured, is_unlocked: false },
    isLoading: false,
  } as unknown as ReturnType<typeof useVaultStatus>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useVaultStore.getState().lock()
  vi.mocked(useFeatureGate).mockReturnValue({
    hasFeature: () => true,
    getLimit: () => null,
    plan: 'professional',
    isLoading: false,
  })
  vi.mocked(useVaultItems).mockReturnValue({
    data: { items: mockItems, total: 1 },
    isLoading: false,
  } as unknown as ReturnType<typeof useVaultItems>)
  vi.mocked(useLockVault).mockReturnValue({ mutate: vi.fn() } as unknown as ReturnType<typeof useLockVault>)
  vi.mocked(useUnlockVault).mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false } as unknown as ReturnType<typeof useUnlockVault>)
  vi.mocked(useRevealVaultItem).mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useRevealVaultItem>)
  vi.mocked(useDeleteVaultItem).mockReturnValue({ mutate: vi.fn() } as unknown as ReturnType<typeof useDeleteVaultItem>)
  vi.mocked(useSharedVaultItems).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useSharedVaultItems>)
  vi.mocked(useRevealSharedVaultItem).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useRevealSharedVaultItem>)
  vi.mocked(useItemShares).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useItemShares>)
  vi.mocked(useShareVaultItem).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useShareVaultItem>)
  vi.mocked(useRevokeVaultShare).mockReturnValue({
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useRevokeVaultShare>)
  vi.mocked(useTeamDirectory).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useTeamDirectory>)
})

describe('VaultPage', () => {
  it('prompts to configure the master password when not configured', () => {
    setStatus(false)
    renderPage()
    expect(screen.getByText('Configura tu Bóveda')).toBeInTheDocument()
    expect(screen.getByText('Ir a Configuración')).toBeInTheDocument()
  })

  it('shows the unlock prompt when configured but locked', () => {
    setStatus(true)
    renderPage()
    expect(screen.getByText('Bóveda bloqueada')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña maestra')).toBeInTheDocument()
  })

  it('shows the items list when unlocked', () => {
    setStatus(true)
    useVaultStore.getState().unlock('tok', 900)
    renderPage()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Nuevo elemento')).toBeInTheDocument()
  })

  it('renders the upgrade prompt when the vault feature is disabled', () => {
    setStatus(true)
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => false,
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })
    renderPage()
    expect(screen.queryByText('Bóveda bloqueada')).not.toBeInTheDocument()
  })

  it('shows shared items with the "Compartido" badge alongside own items', () => {
    setStatus(true)
    useVaultStore.getState().unlock('tok', 900)
    vi.mocked(useSharedVaultItems).mockReturnValue({
      data: mockSharedItems,
      isLoading: false,
    } as unknown as ReturnType<typeof useSharedVaultItems>)
    renderPage()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Shared Login')).toBeInTheDocument()
    expect(screen.getByText('Compartido')).toBeInTheDocument()
    expect(screen.getByTitle('Compartido por Otro Usuario')).toBeInTheDocument()
    // Combined count badge: 1 own + 1 shared.
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('opens the share modal when clicking the share button on an own item', () => {
    setStatus(true)
    useVaultStore.getState().unlock('tok', 900)
    renderPage()
    fireEvent.click(screen.getByLabelText('Compartir'))
    expect(screen.getByText('Compartir elemento')).toBeInTheDocument()
  })

  it('reveals a shared item in a read-only modal', () => {
    setStatus(true)
    useVaultStore.getState().unlock('tok', 900)
    const mutate = vi.fn((_shareId, options) => {
      options.onSuccess({
        share_id: 'sh-1',
        item_id: 'item-2',
        title: 'Shared Login',
        item_type: 'login',
        shared_by_name: 'Otro Usuario',
        data: { username: 'bob', password: 'hunter2' },
      })
    })
    vi.mocked(useSharedVaultItems).mockReturnValue({
      data: mockSharedItems,
      isLoading: false,
    } as unknown as ReturnType<typeof useSharedVaultItems>)
    vi.mocked(useRevealSharedVaultItem).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRevealSharedVaultItem>)

    renderPage()
    fireEvent.click(screen.getByLabelText('Ver'))
    expect(screen.getByText('Compartido por Otro Usuario · solo lectura')).toBeInTheDocument()
  })
})
