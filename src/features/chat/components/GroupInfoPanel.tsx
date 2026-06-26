import { X, LogOut } from 'lucide-react'
import { Avatar } from './Avatar'
import type { ConversationDetail } from '../types'

interface GroupInfoPanelProps {
  conversation: ConversationDetail
  onClose: () => void
  onLeave: () => void
}

export function GroupInfoPanel({ conversation, onClose, onLeave }: GroupInfoPanelProps) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Información</h3>
        <button type="button" aria-label="Cerrar panel" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <Avatar
          name={conversation.display_avatar.name}
          color={conversation.avatar_color}
          isGroup={conversation.type === 'group'}
          size="lg"
        />
        <p className="mt-2 font-medium text-gray-900 dark:text-gray-100">{conversation.display_name}</p>
        <p className="text-xs text-gray-500">{conversation.member_count} miembros</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Miembros</p>
        {conversation.members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar name={member.user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{member.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
            </div>
            {member.role === 'owner' && (
              <span className="text-xs text-primary-600 font-medium">Owner</span>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onLeave}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4" />
          {conversation.type === 'group' ? 'Salir del grupo' : 'Eliminar chat'}
        </button>
      </div>
    </div>
  )
}
