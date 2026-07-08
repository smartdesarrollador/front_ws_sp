import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShareResourceModal } from '../ShareResourceModal'

vi.mock('../../hooks/useResourceShares')
vi.mock('../../hooks/useCreateShare')
vi.mock('../../hooks/useRevokeShare')
vi.mock('../../hooks/useTeamDirectory')

import { useResourceShares } from '../../hooks/useResourceShares'
import { useCreateShare } from '../../hooks/useCreateShare'
import { useRevokeShare } from '../../hooks/useRevokeShare'
import { useTeamDirectory } from '../../hooks/useTeamDirectory'

const mockTeammates = [
  { id: 'u-1', name: 'Cliente 109', email: 'cliente109@cliente.com' },
]

function renderModal(
  resources: { id: string; title: string }[] = [{ id: 'note-1', title: 'Nota 1' }],
) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <ShareResourceModal resourceType="note" resources={resources} onClose={() => {}} />
    </QueryClientProvider>,
  )
}

describe('ShareResourceModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useResourceShares).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useResourceShares>)

    vi.mocked(useCreateShare).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateShare>)

    vi.mocked(useRevokeShare).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useRevokeShare>)

    vi.mocked(useTeamDirectory).mockReturnValue({
      data: mockTeammates,
      isLoading: false,
    } as unknown as ReturnType<typeof useTeamDirectory>)
  })

  it('shows the "Elegir del equipo" select when there are teammates', () => {
    renderModal()
    expect(screen.getByLabelText('Elegir del equipo')).toBeInTheDocument()
    expect(screen.getByText('Cliente 109 (cliente109@cliente.com)')).toBeInTheDocument()
  })

  it('fills the email input when a teammate is selected', () => {
    renderModal()
    const select = screen.getByLabelText('Elegir del equipo')
    act(() => {
      fireEvent.change(select, { target: { value: 'cliente109@cliente.com' } })
    })
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com') as HTMLInputElement
    expect(emailInput.value).toBe('cliente109@cliente.com')
  })

  it('hides the select when there are no teammates', () => {
    vi.mocked(useTeamDirectory).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useTeamDirectory>)
    renderModal()
    expect(screen.queryByLabelText('Elegir del equipo')).not.toBeInTheDocument()
  })

  it('still allows typing an arbitrary email manually', () => {
    renderModal()
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'externo@otraempresa.com' } })
    expect(emailInput.value).toBe('externo@otraempresa.com')
  })

  it('shows an upgrade-plan message when sharing fails with 402', async () => {
    const mutate = vi.fn((_vars, options) => {
      options.onError({ response: { status: 402 } })
    })
    vi.mocked(useCreateShare).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateShare>)

    renderModal()
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com')
    fireEvent.change(emailInput, { target: { value: 'cliente109@cliente.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))

    expect(
      await screen.findByText(
        'Para compartir necesitas un plan superior. Actualiza tu plan para desbloquear esta función.',
      ),
    ).toBeInTheDocument()
  })

  describe('bulk mode (varios recursos)', () => {
    const bulkResources = [
      { id: 'n-1', title: 'Nota 1' },
      { id: 'n-2', title: 'Nota 2' },
      { id: 'n-3', title: 'Nota 3' },
    ]

    it('shows a combined title and hides "Con acceso" for multiple resources', () => {
      renderModal(bulkResources)
      expect(screen.getByText('Compartir 3 elementos')).toBeInTheDocument()
      expect(screen.queryByText('Con acceso')).not.toBeInTheDocument()
    })

    it('shares all resources and reports full success', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({})
      vi.mocked(useCreateShare).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useCreateShare>)

      renderModal(bulkResources)
      const emailInput = screen.getByPlaceholderText('correo@ejemplo.com')
      fireEvent.change(emailInput, { target: { value: 'cliente109@cliente.com' } })
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))
      })

      expect(mutateAsync).toHaveBeenCalledTimes(3)
      expect(await screen.findByText('3 de 3 compartidos correctamente.')).toBeInTheDocument()
    })

    it('reports partial failure when some shares fail', async () => {
      const mutateAsync = vi
        .fn()
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce({})
      vi.mocked(useCreateShare).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useCreateShare>)

      renderModal(bulkResources)
      const emailInput = screen.getByPlaceholderText('correo@ejemplo.com')
      fireEvent.change(emailInput, { target: { value: 'cliente109@cliente.com' } })
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))
      })

      expect(
        await screen.findByText('2 de 3 compartidos — 1 falló.'),
      ).toBeInTheDocument()
    })
  })
})
