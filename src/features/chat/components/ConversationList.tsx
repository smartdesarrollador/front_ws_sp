import { useState } from 'react'
import { Bookmark, Plus, Search, MessageSquare, Users2 } from 'lucide-react'
import { ConversationItem } from './ConversationItem'
import type { Conversation } from '../types'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
  onNewChat: () => void
  onOpenConnections: () => void
  onOpenSelfChat: () => void
}

export function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onNewChat,
  onOpenConnections,
  onOpenSelfChat,
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const selfConversation = conversations.find((c) => c.type === 'self') ?? null
  const selfActive = Boolean(selfConversation && selfConversation.id === activeId)

  // The self-chat is rendered as a fixed pinned entry, so exclude it here.
  const filtered = conversations.filter(
    (c) =>
      c.type !== 'self' &&
      c.display_name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="w-full sm:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Chats</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenConnections}
              aria-label="Conexiones"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Users2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNewChat}
              aria-label="Nuevo chat"
              className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversación"
            aria-label="Buscar conversación"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <button
          type="button"
          onClick={onOpenSelfChat}
          aria-label="Mensajes guardados"
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
            selfActive
              ? 'bg-primary-50 dark:bg-primary-900/30'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <div
            className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white flex-shrink-0"
            aria-hidden="true"
          >
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              Mensajes guardados
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Guarda mensajes para ti
            </p>
          </div>
        </button>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 text-gray-400">
            <MessageSquare className="w-10 h-10 mb-2" />
            <p className="text-sm">No hay conversaciones</p>
            <button
              type="button"
              onClick={onNewChat}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              Iniciar un chat
            </button>
          </div>
        ) : (
          filtered.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  )
}
