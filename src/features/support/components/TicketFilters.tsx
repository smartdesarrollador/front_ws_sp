import type { TicketCategory } from '../types'

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  billing:   'Facturación',
  technical: 'Técnico',
  account:   'Cuenta',
  general:   'General',
}

interface Props {
  search: string
  onSearch: (v: string) => void
  statusFilter: string
  onStatusFilter: (v: string) => void
}

export function TicketFilters({ search, onSearch, statusFilter, onStatusFilter }: Props) {
  return (
    <div className="p-4 border-b border-gray-100 flex gap-3">
      <input
        type="text"
        placeholder="Buscar tickets..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilter(e.target.value)}
        aria-label="Estado"
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="all">Todos los estados</option>
        <option value="open">Abierto</option>
        <option value="in_progress">En progreso</option>
        <option value="resolved">Resuelto</option>
      </select>
    </div>
  )
}
