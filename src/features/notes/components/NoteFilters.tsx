import { Search, Pin } from 'lucide-react'
import type { NoteCategory, NoteFiltersState } from '../types'

interface Props {
  filters: NoteFiltersState
  onChange: (f: NoteFiltersState) => void
  totalCount: number
  categories: NoteCategory[]
  tags: string[]
}

export function NoteFilters({ filters, onChange, totalCount, categories, tags }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar notas..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {categories.length > 0 && (
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          aria-label="Filtrar por categoría"
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
      <select
        value={filters.tag}
        onChange={(e) => onChange({ ...filters, tag: e.target.value })}
        aria-label="Filtrar por etiqueta"
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Todas las etiquetas</option>
        {tags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onChange({ ...filters, pinned_only: !filters.pinned_only })}
        aria-pressed={filters.pinned_only}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
          filters.pinned_only
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400'
            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <Pin className="w-4 h-4" />
        Solo fijadas
      </button>
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{totalCount} notas</span>
    </div>
  )
}
