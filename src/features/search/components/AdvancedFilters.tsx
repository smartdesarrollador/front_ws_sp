import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { ALL_TYPES, TYPE_ICONS, TYPE_LABELS } from '../types'
import type { SearchFiltersState, SearchResultType } from '../types'

interface Props {
  filters: SearchFiltersState
  onChange: (f: SearchFiltersState) => void
}

export function AdvancedFilters({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const toggleType = (type: SearchResultType) => {
    const next = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type]
    onChange({ ...filters, types: next })
  }

  const activeCount =
    filters.types.length + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros avanzados
        {activeCount > 0 && (
          <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="card mt-3 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Tipo de resultado
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map((type) => {
                const Icon = TYPE_ICONS[type]
                const active = filters.types.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      active
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {TYPE_LABELS[type]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Desde</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Hasta</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                className="input"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
