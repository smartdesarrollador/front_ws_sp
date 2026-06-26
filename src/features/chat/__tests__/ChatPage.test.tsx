import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatPage from '../ChatPage'
import { useConversations } from '../hooks/useConversations'
import { useMessages } from '../hooks/useMessages'
import { useSendMessage } from '../hooks/useSendMessage'
import { useCreateConversation } from '../hooks/useCreateConversation'
import { useMarkRead } from '../hooks/useMarkRead'
import { useConvertMessage } from '../hooks/useConvertMessage'
import { useConversationDetail } from '../hooks/useConversationDetail'
import { useLeaveConversation } from '../hooks/useLeaveConversation'
import { useChatUsers } from '../hooks/useChatUsers'
import { useConnections } from '../hooks/useConnections'
import { useChatSocket } from '../hooks/useChatSocket'
import type { Conversation, Message } from '../types'

vi.mock('../hooks/useChatSocket')
vi.mock('../hooks/useConnections')
vi.mock('../hooks/useConversations')
vi.mock('../hooks/useMessages')
vi.mock('../hooks/useSendMessage')
vi.mock('../hooks/useCreateConversation')
vi.mock('../hooks/useMarkRead')
vi.mock('../hooks/useConvertMessage')
vi.mock('../hooks/useConversationDetail')
vi.mock('../hooks/useLeaveConversation')
vi.mock('../hooks/useChatUsers')

const mockConversations: Conversation[] = [
  {
    id: 'c1',
    type: 'direct',
    name: '',
    avatar_color: 'blue',
    display_name: 'Bob Jones',
    display_avatar: { type: 'user', name: 'Bob Jones', avatar_url: '', color: 'blue' },
    last_message: { id: 'm1', content: 'Hola', sender_name: 'Bob Jones', created_at: '2026-06-26T10:00:00Z' },
    unread_count: 2,
    member_count: 2,
    other_user_id: 'u2',
    updated_at: '2026-06-26T10:00:00Z',
  },
]

const mockMessages: Message[] = [
  {
    id: 'm1',
    conversation: 'c1',
    sender: { id: 'u2', name: 'Bob Jones', email: 'bob@x.com', avatar_url: '' },
    content: 'Hola Alice',
    reply_to: null,
    is_mine: false,
    is_deleted: false,
    attachments: [],
    edited_at: null,
    created_at: '2026-06-26T10:00:00Z',
  },
]

const sendMutate = vi.fn()
const createMutate = vi.fn()
const markReadMutate = vi.fn()
const convertMutate = vi.fn()
const leaveMutate = vi.fn()

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <ChatPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useConversations).mockReturnValue({
    data: { conversations: mockConversations, total: 1 },
    isLoading: false,
  } as unknown as ReturnType<typeof useConversations>)
  vi.mocked(useMessages).mockReturnValue({
    data: { results: mockMessages, count: 1, has_more: false },
    isLoading: false,
  } as unknown as ReturnType<typeof useMessages>)
  vi.mocked(useSendMessage).mockReturnValue({ mutate: sendMutate, isPending: false } as unknown as ReturnType<typeof useSendMessage>)
  vi.mocked(useCreateConversation).mockReturnValue({ mutate: createMutate, isPending: false } as unknown as ReturnType<typeof useCreateConversation>)
  vi.mocked(useMarkRead).mockReturnValue({ mutate: markReadMutate } as unknown as ReturnType<typeof useMarkRead>)
  vi.mocked(useConvertMessage).mockReturnValue({ mutate: convertMutate } as unknown as ReturnType<typeof useConvertMessage>)
  vi.mocked(useConversationDetail).mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useConversationDetail>)
  vi.mocked(useLeaveConversation).mockReturnValue({ mutate: leaveMutate } as unknown as ReturnType<typeof useLeaveConversation>)
  vi.mocked(useChatUsers).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useChatUsers>)
  vi.mocked(useConnections).mockReturnValue({
    data: { accepted: [], pending_incoming: [], pending_outgoing: [] },
  } as unknown as ReturnType<typeof useConnections>)
  vi.mocked(useChatSocket).mockReturnValue({
    connected: true,
    typing: {},
    onlineUserIds: new Set<string>(),
    sendTyping: vi.fn(),
  } as unknown as ReturnType<typeof useChatSocket>)
})

describe('ChatPage', () => {
  it('renders the conversation list', () => {
    setup()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // unread badge
  })

  it('shows empty state when no conversation is selected', () => {
    setup()
    expect(
      screen.getByText('Selecciona una conversación o inicia una nueva'),
    ).toBeInTheDocument()
  })

  it('opens a conversation and shows its messages', () => {
    setup()
    fireEvent.click(screen.getByText('Bob Jones'))
    expect(screen.getByText('Hola Alice')).toBeInTheDocument()
  })

  it('marks the conversation as read on open', () => {
    setup()
    fireEvent.click(screen.getByText('Bob Jones'))
    expect(markReadMutate).toHaveBeenCalledWith('c1')
  })

  it('sends a message', () => {
    setup()
    fireEvent.click(screen.getByText('Bob Jones'))
    const textarea = screen.getByLabelText('Escribe un mensaje')
    fireEvent.change(textarea, { target: { value: 'Hola Bob' } })
    fireEvent.click(screen.getByLabelText('Enviar mensaje'))
    expect(sendMutate).toHaveBeenCalledWith(
      expect.objectContaining({ conversation: 'c1', content: 'Hola Bob', file: null }),
      expect.any(Object),
    )
  })

  it('opens the new chat modal', () => {
    setup()
    fireEvent.click(screen.getByLabelText('Nuevo chat'))
    expect(screen.getByText('Nuevo chat')).toBeInTheDocument()
  })

  it('converts a message via the bubble menu', () => {
    setup()
    fireEvent.click(screen.getByText('Bob Jones'))
    fireEvent.click(screen.getByLabelText('Opciones del mensaje'))
    fireEvent.click(screen.getByText('Convertir a Nota'))
    expect(convertMutate).toHaveBeenCalledWith(
      expect.objectContaining({ messageId: 'm1', payload: { target: 'note' } }),
      expect.any(Object),
    )
  })
})
