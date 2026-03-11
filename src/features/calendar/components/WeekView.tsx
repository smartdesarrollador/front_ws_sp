import type { CalendarEvent } from '../types'
import { EventCard } from './EventCard'

interface Props {
  events: CalendarEvent[]
  currentDate: Date
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}

const ABBREVIATED_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
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

export function WeekView({ events, currentDate, onEdit, onDelete }: Props) {
  // Start of week (Sunday)
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    return d
  })

  const today = new Date()

  const isToday = (date: Date): boolean =>
    date.toDateString() === today.toDateString()

  const getEventsForSlot = (date: Date, hour: number): CalendarEvent[] => {
    const dateStr = toDateStr(date)
    return events.filter((e) => {
      if (!e.start_date.startsWith(dateStr)) return false
      return getEventHour(e) === hour
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
          <div className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
            Hora
          </div>
          {weekDays.map((date, i) => (
            <div
              key={i}
              className={`p-2 text-center border-r border-gray-200 dark:border-gray-600 ${
                isToday(date) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {ABBREVIATED_DAYS[i]}
              </div>
              <div
                className={`text-sm font-semibold ${
                  isToday(date)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Hour rows */}
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
            <div className="h-12 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 flex items-start pt-1">
              {hour}:00
            </div>
            {weekDays.map((date, i) => {
              const slotEvents = getEventsForSlot(date, hour)
              return (
                <div
                  key={i}
                  className="h-12 p-0.5 border-r border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 space-y-0.5 overflow-hidden"
                >
                  {slotEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      compact
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
