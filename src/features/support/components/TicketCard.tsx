import type { SupportTicket } from '../types'
import { TicketStatusBadge } from './TicketStatusBadge'
import { PriorityBadge } from './PriorityBadge'

interface Props {
  ticket: SupportTicket
  selected: boolean
  onSelect: (t: SupportTicket) => void
}

export function TicketCard({ ticket, selected, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(ticket)}
      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
        selected ? 'bg-primary-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">#{ticket.reference}</p>
          <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex gap-1">
            <TicketStatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <p className="text-xs text-gray-400">
            {new Date(ticket.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
