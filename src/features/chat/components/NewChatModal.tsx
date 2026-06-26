import { useMemo, useState } from 'react'
import { X, Search, Users, User, Building2 } from 'lucide-react'
import { useChatUsers } from '../hooks/useChatUsers'
import { useConnections } from '../hooks/useConnections'
import { Avatar } from './Avatar'
import type { ChatUser, ConversationType, CreateConversationRequest } from '../types'

interface NewChatModalProps {
  onClose: () => void
  onCreate: (payload: CreateConversationRequest) => void
  isCreating: boolean
}

interface PickableUser extends ChatUser {
  company?: string
}

export function NewChatModal({ onClose, onCreate, isCreating }: NewChatModalProps) {
  const { data: users = [], isLoading } = useChatUsers()
  const { data: connectionsData } = useConnections()
  const [mode, setMode] = useState<ConversationType>('direct')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')

  // Merge same-tenant users with accepted cross-tenant connections (deduped).
  const pickable = useMemo<PickableUser[]>(() => {
    const map = new Map<string, PickableUser>()
    for (const u of users) map.set(u.id, u)
    for (const conn of connectionsData?.accepted ?? []) {
      if (!map.has(conn.other_user.id)) {
        map.set(conn.other_user.id, { ...conn.other_user, company: conn.tenant_name })
      }
    }
    return Array.from(map.values())
  }, [users, connectionsData])

  const filtered = pickable.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const toggle = (id: string) => {
    if (mode === 'direct') {
      setSelected([id])
      return
    }
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const canSubmit =
    selected.length > 0 && (mode === 'direct' || groupName.trim().length > 0)

  const handleSubmit = () => {
    if (!canSubmit) return
    onCreate({
      type: mode,
      member_ids: selected,
      ...(mode === 'group' ? { name: groupName.trim() } : {}),
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="new-chat-title" className="font-semibold text-gray-900 dark:text-gray-100">
            Nuevo chat
          </h2>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('direct')
                setSelected((prev) => prev.slice(0, 1))
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium ${
                mode === 'direct'
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <User className="w-4 h-4" /> Directo
            </button>
            <button
              type="button"
              onClick={() => setMode('group')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium ${
                mode === 'group'
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" /> Grupo
            </button>
          </div>

          {mode === 'group' && (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nombre del grupo"
              aria-label="Nombre del grupo"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuario"
              aria-label="Buscar usuario"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-1">
          {isLoading ? (
            <p className="text-sm text-gray-400 py-4 text-center">Cargando usuarios…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay usuarios disponibles</p>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => toggle(user.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left ${
                  selected.includes(user.id)
                    ? 'bg-primary-50 dark:bg-primary-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Avatar name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                  {user.company ? (
                    <p className="flex items-center gap-1 text-xs text-primary-600 truncate">
                      <Building2 className="w-3 h-3" /> {user.company}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  )}
                </div>
                {selected.includes(user.id) && (
                  <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isCreating}
            className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isCreating ? 'Creando…' : 'Iniciar chat'}
          </button>
        </div>
      </div>
    </div>
  )
}
