import { X } from 'lucide-react'
import { useTicketDetail } from '../hooks/useTicketDetail'
import { TicketStatusBadge } from './TicketStatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { CATEGORY_LABELS } from './TicketFilters'
import { CommentThread } from './CommentThread'
import { CommentInput } from './CommentInput'

interface Props {
  ticketId: string | null
  onClose: () => void
}

export function TicketDetailView({ ticketId, onClose }: Props) {
  const { ticket, isLoading } = useTicketDetail(ticketId)

  if (!ticketId) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-full max-w-xl bg-white shadow-xl z-40 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {isLoading ? (
            <div className="animate-pulse h-5 bg-gray-200 rounded w-48" />
          ) : (
            <div className="min-w-0">
              <p className="text-xs text-gray-400">#{ticket?.reference}</p>
              <h2 className="text-base font-semibold text-gray-900 truncate">{ticket?.subject}</h2>
            </div>
          )}
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : ticket ? (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Metadata */}
            <div className="px-6 py-4 border-b border-gray-100 space-y-3">
              <div className="flex flex-wrap gap-2">
                <TicketStatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {CATEGORY_LABELS[ticket.category]}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Abierto el:{' '}
                {new Date(ticket.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-700">{ticket.description}</p>
            </div>

            {/* Comments */}
            <div className="px-6 py-4 flex-1">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Comentarios</h3>
              <CommentThread comments={ticket.comments} />
            </div>

            {/* Comment input */}
            <div className="px-6 py-4">
              <CommentInput ticketId={ticket.id} />
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
