import type { CalendarEvent } from '../types'
import { EventCard } from './EventCard'

interface Props {
  events: CalendarEvent[]
  currentDate: Date
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
  onDayClick: (date: Date) => void
}

const DAY_HEADERS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function MonthView({ events, currentDate, onEdit, onDelete, onDayClick }: Props) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const prevMonthDays = Array.from({ length: startDayOfWeek }, (_, i) => ({
    day: daysInPrevMonth - startDayOfWeek + 1 + i,
    isCurrentMonth: false,
    isPrev: true,
  }))

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: true,
    isPrev: false,
  }))

  const totalSoFar = prevMonthDays.length + currentMonthDays.length
  const nextCount = totalSoFar % 7 === 0 ? 0 : 7 - (totalSoFar % 7)
  const nextMonthDays = Array.from({ length: nextCount }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: false,
    isPrev: false,
  }))

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  const getEventsForDay = (
    day: number,
    isCurrentMonth: boolean,
    isPrev: boolean,
  ): CalendarEvent[] => {
    let date: Date
    if (isCurrentMonth) {
      date = new Date(year, month, day)
    } else if (isPrev) {
      date = new Date(year, month - 1, day)
    } else {
      date = new Date(year, month + 1, day)
    }
    const dateStr = toDateStr(date)
    return events.filter((e) => e.start_date.startsWith(dateStr))
  }

  const today = new Date()
  const isToday = (day: number, isCurrentMonth: boolean): boolean => {
    if (!isCurrentMonth) return false
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {allDays.map((dayObj, index) => {
          const dayEvents = getEventsForDay(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrev)
          const isTodayDay = isToday(dayObj.day, dayObj.isCurrentMonth)
          const visibleEvents = dayEvents.slice(0, 3)
          const hiddenCount = dayEvents.length - 3

          return (
            <div
              key={index}
              className={`min-h-[100px] p-1.5 border-r border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                !dayObj.isCurrentMonth ? 'opacity-40' : ''
              }`}
              onClick={() => {
                if (dayObj.isCurrentMonth) {
                  onDayClick(new Date(year, month, dayObj.day))
                }
              }}
            >
              <div className="mb-1 flex justify-start">
                {isTodayDay ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-xs font-bold">
                    {dayObj.day}
                  </span>
                ) : (
                  <span
                    className={`text-xs font-medium ${
                      dayObj.isCurrentMonth
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {dayObj.day}
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                {visibleEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    compact
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
                {hiddenCount > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                    +{hiddenCount} más
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
