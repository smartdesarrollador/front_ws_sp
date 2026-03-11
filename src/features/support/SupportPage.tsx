import { useState, useMemo, type ElementType } from 'react'
import { LifeBuoy, Ticket, CircleAlert, Clock, MessageCircle } from 'lucide-react'
import { useTickets } from './hooks/useTickets'
import { TicketFilters } from './components/TicketFilters'
import { TicketCard } from './components/TicketCard'
import { TicketDetailView } from './components/TicketDetailView'
import { NewTicketModal } from './components/NewTicketModal'

interface KpiCardProps {
  label: string
  value: number
  icon: ElementType
  color?: 'default' | 'blue' | 'yellow'
}

function KpiCard({ label, value, icon: Icon, color = 'default' }: KpiCardProps) {
  const colorMap = {
    default: 'bg-gray-50 text-gray-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function SupportPage() {
  const { tickets, isLoading } = useTickets()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [tickets, search, statusFilter])

  const total = tickets.length
  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LifeBuoy className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Soporte</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Nuevo ticket
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total" value={total} icon={Ticket} />
        <KpiCard label="Abiertos" value={openCount} icon={CircleAlert} color="blue" />
        <KpiCard label="En progreso" value={inProgressCount} icon={Clock} color="yellow" />
      </div>

      {/* Ticket list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <TicketFilters
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <MessageCircle className="w-10 h-10 mb-2" />
            <p className="text-sm">No hay tickets</p>
          </div>
        ) : (
          <div>
            {filteredTickets.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                selected={selectedId === t.id}
                onSelect={(tk) => setSelectedId(tk.id)}
              />
            ))}
          </div>
        )}
      </div>

      <TicketDetailView ticketId={selectedId} onClose={() => setSelectedId(null)} />
      <NewTicketModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
