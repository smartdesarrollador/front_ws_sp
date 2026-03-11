import type { TicketStatus } from '../types'

export const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  open:           { label: 'Abierto',     className: 'bg-blue-100 text-blue-700' },
  in_progress:    { label: 'En progreso', className: 'bg-yellow-100 text-yellow-700' },
  waiting_client: { label: 'En espera',   className: 'bg-orange-100 text-orange-700' },
  resolved:       { label: 'Resuelto',    className: 'bg-green-100 text-green-700' },
  closed:         { label: 'Cerrado',     className: 'bg-gray-100 text-gray-600' },
}

interface Props {
  status: TicketStatus
}

export function TicketStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.open
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
