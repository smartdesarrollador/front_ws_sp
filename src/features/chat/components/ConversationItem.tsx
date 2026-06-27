import { Avatar } from './Avatar'
import { relativeTime } from '../utils'
import type { Conversation } from '../types'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: (id: string) => void
}

export function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
  const { display_avatar, display_name, last_message, unread_count } = conversation
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/30'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <Avatar
        name={display_avatar.name}
        color={display_avatar.color}
        isGroup={display_avatar.type === 'group'}
        isSelf={display_avatar.type === 'self'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {display_name}
          </p>
          {last_message && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {relativeTime(last_message.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {last_message ? last_message.content || 'Mensaje eliminado' : 'Sin mensajes aún'}
          </p>
          {unread_count > 0 && (
            <span className="flex-shrink-0 min-w-[1.25rem] h-5 px-1.5 bg-primary-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
