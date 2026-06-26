import { useState } from 'react'
import { X, UserPlus, Check, Clock, Building2, MessageSquare } from 'lucide-react'
import { useConnections } from '../hooks/useConnections'
import { useInviteConnection } from '../hooks/useInviteConnection'
import { useRespondConnection } from '../hooks/useRespondConnection'
import { Avatar } from './Avatar'
import type { ChatConnection } from '../types'

interface ConnectionsModalProps {
  onClose: () => void
  onStartChat: (userId: string) => void
}

export function ConnectionsModal({ onClose, onStartChat }: ConnectionsModalProps) {
  const { data, isLoading } = useConnections()
  const invite = useInviteConnection()
  const respond = useRespondConnection()
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null)

  const handleInvite = () => {
    const trimmed = email.trim()
    if (!trimmed) return
    setFeedback(null)
    invite.mutate(trimmed, {
      onSuccess: (conn) => {
        setEmail('')
        // Unregistered email → pending invite that activates on registration.
        const pendingEmail = conn?.status === 'pending' && !conn?.other_user?.id
        setFeedback({
          text: pendingEmail
            ? 'Invitación enviada; se conectará cuando se registre'
            : 'Solicitud enviada',
          error: false,
        })
      },
      onError: () => {
        setFeedback({ text: 'No se pudo enviar la solicitud', error: true })
      },
    })
  }

  const incoming = data?.pending_incoming ?? []
  const outgoing = data?.pending_outgoing ?? []
  const accepted = data?.accepted ?? []

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connections-title"
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="connections-title" className="font-semibold text-gray-900 dark:text-gray-100">
            Conexiones
          </h2>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Invitar por email (usuario de otra cuenta)
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              placeholder="persona@empresa.com"
              aria-label="Email a invitar"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={handleInvite}
              disabled={!email.trim() || invite.isPending}
              className="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1 text-sm"
            >
              <UserPlus className="w-4 h-4" /> Invitar
            </button>
          </div>
          {feedback && (
            <p className={`mt-1 text-xs ${feedback.error ? 'text-red-600' : 'text-green-600'}`}>
              {feedback.text}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">Cargando…</p>
          ) : (
            <>
              <ConnectionSection title="Solicitudes recibidas" icon={Clock} items={incoming}>
                {(conn) => (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => respond.mutate({ id: conn.id, action: 'accept' })}
                      aria-label="Aceptar"
                      className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => respond.mutate({ id: conn.id, action: 'reject' })}
                      aria-label="Rechazar"
                      className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </ConnectionSection>

              <ConnectionSection title="Solicitudes enviadas" icon={Clock} items={outgoing}>
                {() => <span className="text-xs text-gray-400">Pendiente</span>}
              </ConnectionSection>

              <ConnectionSection title="Conexiones" icon={Check} items={accepted}>
                {(conn) => (
                  <button
                    type="button"
                    onClick={() => onStartChat(conn.other_user.id)}
                    className="p-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30"
                    aria-label={`Chatear con ${conn.other_user.name}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </ConnectionSection>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface ConnectionSectionProps {
  title: string
  icon: typeof Clock
  items: ChatConnection[]
  children: (conn: ChatConnection) => React.ReactNode
}

function ConnectionSection({ title, icon: Icon, items, children }: ConnectionSectionProps) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        <Icon className="w-3.5 h-3.5" /> {title} ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 pl-1">Ninguna</p>
      ) : (
        <div className="space-y-1">
          {items.map((conn) => (
            <div key={conn.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <Avatar name={conn.other_user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {conn.other_user.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
                  <Building2 className="w-3 h-3" /> {conn.tenant_name || conn.other_user.email}
                </p>
              </div>
              {children(conn)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
