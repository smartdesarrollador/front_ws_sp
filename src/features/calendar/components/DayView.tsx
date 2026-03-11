import type { CalendarEvent } from '../types'
import { EventCard } from './EventCard'

interface Props {
  events: CalendarEvent[]
  currentDate: Date
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8–20

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getEventHour(event: CalendarEvent): number {
  if (!event.start_date.includes('T')) return -1
  return parseInt(event.start_date.split('T')[1].split(':')[0], 10)
}

export function DayView({ events, currentDate, onEdit, onDelete }: Props) {
  const dateStr = toDateStr(currentDate)

  const getEventsForHour = (hour: number): CalendarEvent[] =>
    events.filter((e) => e.start_date.startsWith(dateStr) && getEventHour(e) === hour)

  const fullDateLabel = currentDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Day header */}
      <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">
          {fullDateLabel}
        </h3>
      </div>

      {/* Hour slots */}
      {HOURS.map((hour) => {
        const hourEvents = getEventsForHour(hour)
        return (
          <div
            key={hour}
            className="flex border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <div className="w-16 shrink-0 p-3 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
              {hour}:00
            </div>
            <div className="flex-1 min-h-[72px] p-2 space-y-2">
              {hourEvents.map((event) => (
                <EventCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
