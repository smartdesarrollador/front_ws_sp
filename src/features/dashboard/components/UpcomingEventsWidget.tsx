import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { UpcomingEvent } from '../types'

interface Props {
  events: UpcomingEvent[]
  isLoading: boolean
}

function formatEventDate(event: UpcomingEvent): string {
  const date = new Date(event.start_datetime)
  const dayMonth = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  if (event.all_day) return dayMonth
  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return `${dayMonth} ${time}`
}

export function UpcomingEventsWidget({ events, isLoading }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Próximos Eventos</h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-8 rounded bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
          No hay eventos próximos
        </p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color ?? '#6b7280' }}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 w-16">
                {formatEventDate(event)}
              </span>
              <span className="truncate text-gray-700 dark:text-gray-300">{event.title}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => navigate('/calendar')}
        className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
      >
        Ver calendario <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  )
}
