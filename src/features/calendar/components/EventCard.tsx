import { useState } from 'react'
import { Pencil, Trash2, MapPin } from 'lucide-react'
import type { CalendarEvent } from '../types'
import { CATEGORY_LABELS } from '../types'

interface Props {
  event: CalendarEvent
  compact?: boolean
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}

function formatTime(dateStr: string): string {
  if (!dateStr.includes('T')) return ''
  const [, time] = dateStr.split('T')
  return time.slice(0, 5)
}

export function EventCard({ event, compact = false, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirming) {
      onDelete(event.id)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  const startTime = formatTime(event.start_date)
  const endTime = formatTime(event.end_date)

  if (compact) {
    return (
      <div
        className="group relative text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: event.color + '20', color: event.color, borderLeft: `3px solid ${event.color}` }}
        onClick={(e) => { e.stopPropagation(); onEdit(event) }}
        title={event.title}
      >
        <span className="font-medium">
          {startTime && `${startTime} `}{event.title}
        </span>
        <div className="absolute right-1 top-0 bottom-0 hidden group-hover:flex items-center gap-0.5 bg-inherit">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(event) }}
            aria-label="Editar evento"
            className="p-0.5 hover:opacity-70"
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            aria-label={confirming ? 'Confirmar eliminación' : 'Eliminar evento'}
            className="p-0.5 hover:opacity-70"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderLeft: `4px solid ${event.color}` }}
      onClick={() => onEdit(event)}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {event.title}
          </p>
          {!event.all_day && startTime && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {startTime}{endTime ? ` - ${endTime}` : ''}
            </p>
          )}
          {event.all_day && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Todo el día</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(event)}
            aria-label="Editar evento"
            className="p-1 text-gray-400 hover:text-primary-600 rounded"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            aria-label={confirming ? 'Confirmar eliminación' : 'Eliminar evento'}
            className={`p-1 rounded ${
              confirming
                ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-400 hover:text-red-600'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {event.location && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      )}

      <div className="mt-2">
        <span
          className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: event.color + '20', color: event.color }}
        >
          {CATEGORY_LABELS[event.category] ?? event.category}
        </span>
      </div>
    </div>
  )
}
