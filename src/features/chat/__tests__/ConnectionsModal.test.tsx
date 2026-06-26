import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectionsModal } from '../components/ConnectionsModal'
import { useConnections } from '../hooks/useConnections'
import { useInviteConnection } from '../hooks/useInviteConnection'
import { useRespondConnection } from '../hooks/useRespondConnection'
import type { ConnectionsResponse } from '../types'

vi.mock('../hooks/useConnections')
vi.mock('../hooks/useInviteConnection')
vi.mock('../hooks/useRespondConnection')

const connections: ConnectionsResponse = {
  accepted: [
    {
      id: 'a1',
      status: 'accepted',
      direction: 'outgoing',
      other_user: { id: 'u9', name: 'Zoe Cross', email: 'zoe@y.com', avatar_url: '' },
      tenant_name: 'Empresa Y',
      created_at: '2026-06-26T10:00:00Z',
    },
  ],
  pending_incoming: [
    {
      id: 'p1',
      status: 'pending',
      direction: 'incoming',
      other_user: { id: 'u8', name: 'Max Power', email: 'max@z.com', avatar_url: '' },
      tenant_name: 'Empresa Z',
      created_at: '2026-06-26T09:00:00Z',
    },
  ],
  pending_outgoing: [],
}

const inviteMutate = vi.fn()
const respondMutate = vi.fn()

function setup(onStartChat = vi.fn()) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <ConnectionsModal onClose={vi.fn()} onStartChat={onStartChat} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useConnections).mockReturnValue({ data: connections, isLoading: false } as unknown as ReturnType<typeof useConnections>)
  vi.mocked(useInviteConnection).mockReturnValue({ mutate: inviteMutate, isPending: false } as unknown as ReturnType<typeof useInviteConnection>)
  vi.mocked(useRespondConnection).mockReturnValue({ mutate: respondMutate } as unknown as ReturnType<typeof useRespondConnection>)
})

describe('ConnectionsModal', () => {
  it('lists accepted connections and pending requests', () => {
    setup()
    expect(screen.getByText('Zoe Cross')).toBeInTheDocument()
    expect(screen.getByText('Max Power')).toBeInTheDocument()
    expect(screen.getByText('Empresa Y')).toBeInTheDocument()
  })

  it('invites by email', () => {
    setup()
    fireEvent.change(screen.getByLabelText('Email a invitar'), { target: { value: 'new@x.com' } })
    fireEvent.click(screen.getByText('Invitar'))
    expect(inviteMutate).toHaveBeenCalledWith('new@x.com', expect.any(Object))
  })

  it('accepts an incoming request', () => {
    setup()
    fireEvent.click(screen.getByLabelText('Aceptar'))
    expect(respondMutate).toHaveBeenCalledWith({ id: 'p1', action: 'accept' })
  })

  it('starts a chat from an accepted connection', () => {
    const onStartChat = vi.fn()
    setup(onStartChat)
    fireEvent.click(screen.getByLabelText('Chatear con Zoe Cross'))
    expect(onStartChat).toHaveBeenCalledWith('u9')
  })
})
