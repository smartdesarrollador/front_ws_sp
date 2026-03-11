import { Search } from 'lucide-react'
import type { BookmarkFiltersState, BookmarkCollection } from '../types'

export const EMPTY_FILTERS: BookmarkFiltersState = { search: '', collection_id: '', tag: '' }

interface Props {
  filters: BookmarkFiltersState
  onChange: (f: BookmarkFiltersState) => void
  totalCount: number
  collections: BookmarkCollection[]
}

export function BookmarkFilters({ filters, onChange, totalCount, collections }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar bookmarks..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {collections.length > 0 && (
        <select
          value={filters.collection_id}
          onChange={(e) => onChange({ ...filters, collection_id: e.target.value })}
          aria-label="Filtrar por colección"
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las colecciones</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
        {totalCount} bookmarks
      </span>
    </div>
  )
}
