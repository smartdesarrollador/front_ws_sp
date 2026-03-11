import type { TicketPriority } from '../types'

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; className: string }> = {
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
  alta:    { label: 'Alta',    className: 'bg-orange-100 text-orange-700' },
  media:   { label: 'Media',   className: 'bg-yellow-100 text-yellow-700' },
  baja:    { label: 'Baja',    className: 'bg-gray-100 text-gray-600' },
}

interface Props {
  priority: TicketPriority
}

export function PriorityBadge({ priority }: Props) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.baja
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
