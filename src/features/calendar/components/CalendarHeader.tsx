import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { CalendarView } from '../types'

interface Props {
  currentDate: Date
  view: CalendarView
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: CalendarView) => void
  onNewEvent: () => void
}

const VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
}

export function CalendarHeader({
  currentDate,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onNewEvent,
}: Props) {
  const getDateLabel = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
        day: 'numeric',
      })
    }
    return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Hoy
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              aria-label="Anterior"
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              aria-label="Siguiente"
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {getDateLabel()}
          </h2>
        </div>

        {/* Right: view toggles + new event */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                aria-pressed={view === v}
                className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                  view === v
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
          <button
            onClick={onNewEvent}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
        </div>
      </div>
    </div>
  )
}
