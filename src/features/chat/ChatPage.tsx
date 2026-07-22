import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { Info, MessageSquare } from 'lucide-react'
import { useConversations } from './hooks/useConversations'
import { useMessages } from './hooks/useMessages'
import { useSendMessage } from './hooks/useSendMessage'
import { useCreateConversation } from './hooks/useCreateConversation'
import { useMarkRead } from './hooks/useMarkRead'
import { useConvertMessage } from './hooks/useConvertMessage'
import { useConversationDetail } from './hooks/useConversationDetail'
import { useLeaveConversation } from './hooks/useLeaveConversation'
import { useSelfConversation } from './hooks/useSelfConversation'
import { useChatSocket } from './hooks/useChatSocket'
import { ConversationList } from './components/ConversationList'
import { MessageThread } from './components/MessageThread'
import { MessageComposer } from './components/MessageComposer'
import { NewChatModal } from './components/NewChatModal'
import { ConnectionsModal } from './components/ConnectionsModal'
import { GroupInfoPanel } from './components/GroupInfoPanel'
import { Avatar } from './components/Avatar'
import { ChatToast, type ToastState } from './components/ChatToast'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import type { ConvertTarget, CreateConversationRequest, Message } from './types'

const CONVERT_LABELS: Record<ConvertTarget, string> = {
  note: 'Nota',
  contact: 'Contacto',
  snippet: 'Snippet',
}

export default function ChatPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const { getLimit } = useFeatureGate()
  const { connected, typing, onlineUserIds, sendTyping } = useChatSocket()
  const { data: convData, isLoading: loadingConvs } = useConversations(connected)
  const conversations = convData?.conversations ?? []
  const { data: messagesData, isLoading: loadingMessages } = useMessages(activeId, connected)
  const { data: activeDetail } = useConversationDetail(activeId, showInfo)

  const sendMessage = useSendMessage()
  const createConversation = useCreateConversation()
  const markRead = useMarkRead()
  const convertMessage = useConvertMessage()
  const leaveConversation = useLeaveConversation()
  const selfConversation = useSelfConversation()

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null
  const activeIsOnline = Boolean(
    activeConversation?.other_user_id && onlineUserIds.has(activeConversation.other_user_id),
  )

  // Mark read whenever an open thread has unread messages.
  useEffect(() => {
    if (activeId && activeConversation && activeConversation.unread_count > 0) {
      markRead.mutate(activeId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, messagesData?.count])

  const handleSelect = (id: string) => {
    setActiveId(id)
    setReplyTo(null)
    setShowInfo(false)
  }

  const handleSend = (content: string, file: File | null) => {
    if (!activeId) return
    sendMessage.mutate(
      { conversation: activeId, content, reply_to: replyTo?.id, file },
      { onSuccess: () => setReplyTo(null) },
    )
  }

  const handleCreate = (payload: CreateConversationRequest) => {
    createConversation.mutate(payload, {
      onSuccess: (conversation) => {
        setShowNewChat(false)
        setActiveId(conversation.id)
      },
    })
  }

  const handleOpenSelfChat = () => {
    selfConversation.mutate(undefined, {
      onSuccess: (conversation) => {
        setReplyTo(null)
        setShowInfo(false)
        setActiveId(conversation.id)
      },
    })
  }

  const handleStartChatFromConnection = (userId: string) => {
    createConversation.mutate(
      { type: 'direct', member_ids: [userId] },
      {
        onSuccess: (conversation) => {
          setShowConnections(false)
          setActiveId(conversation.id)
        },
      },
    )
  }

  const handleConvert = (message: Message, target: ConvertTarget) => {
    convertMessage.mutate(
      { messageId: message.id, payload: { target } },
      {
        onSuccess: () => setToast({ message: `${CONVERT_LABELS[target]} creado correctamente`, variant: 'success' }),
        onError: (error) => {
          const status = error instanceof AxiosError ? error.response?.status : undefined
          const message =
            status === 402
              ? `Has alcanzado el límite de tu plan para ${CONVERT_LABELS[target].toLowerCase()}s`
              : status === 403
                ? `No tienes permiso para crear ${CONVERT_LABELS[target].toLowerCase()}s`
                : 'No se pudo convertir el mensaje'
          setToast({ message, variant: 'error' })
        },
      },
    )
  }

  const handleLeave = () => {
    if (!activeId) return
    leaveConversation.mutate(activeId, {
      onSuccess: () => {
        setActiveId(null)
        setShowInfo(false)
      },
    })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        isLoading={loadingConvs}
        onSelect={handleSelect}
        onNewChat={() => setShowNewChat(true)}
        onOpenConnections={() => setShowConnections(true)}
        onOpenSelfChat={handleOpenSelfChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <>
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  name={activeConversation.display_avatar.name}
                  color={activeConversation.avatar_color}
                  isGroup={activeConversation.type === 'group'}
                  isSelf={activeConversation.type === 'self'}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {activeConversation.display_name}
                  </p>
                  {typing[activeConversation.id] ? (
                    <p className="text-xs text-primary-600 truncate">
                      {typing[activeConversation.id].userName} está escribiendo…
                    </p>
                  ) : activeConversation.type === 'group' ? (
                    <p className="text-xs text-gray-500">{activeConversation.member_count} miembros</p>
                  ) : (
                    activeIsOnline && <p className="text-xs text-green-600">En línea</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Información de la conversación"
                onClick={() => setShowInfo((s) => !s)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            <MessageThread
              messages={messagesData?.results ?? []}
              isLoading={loadingMessages}
              onReply={setReplyTo}
              onConvert={handleConvert}
            />

            <MessageComposer
              replyTo={replyTo}
              onClearReply={() => setReplyTo(null)}
              onSend={handleSend}
              onTyping={() => activeId && sendTyping(activeId)}
              isSending={sendMessage.isPending}
              maxFileMb={getLimit('file_upload_mb')}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-16 h-16 mb-3" />
            <p className="text-sm">Selecciona una conversación o inicia una nueva</p>
          </div>
        )}
      </div>

      {showInfo && activeDetail && (
        <GroupInfoPanel
          conversation={activeDetail}
          onClose={() => setShowInfo(false)}
          onLeave={handleLeave}
        />
      )}

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreate={handleCreate}
          isCreating={createConversation.isPending}
        />
      )}

      {showConnections && (
        <ConnectionsModal
          onClose={() => setShowConnections(false)}
          onStartChat={handleStartChatFromConnection}
        />
      )}

      <ChatToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
