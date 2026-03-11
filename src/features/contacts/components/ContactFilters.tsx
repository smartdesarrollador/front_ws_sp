import { Search } from 'lucide-react'
import type { ContactFiltersState, ContactGroup } from '../types'

export const EMPTY_FILTERS: ContactFiltersState = { search: '', group_id: '' }

interface Props {
  filters: ContactFiltersState
  onChange: (f: ContactFiltersState) => void
  totalCount: number
  groups: ContactGroup[]
}

export function ContactFilters({ filters, onChange, totalCount, groups }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar contactos..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {groups.length > 0 && (
        <select
          value={filters.group_id}
          onChange={(e) => onChange({ ...filters, group_id: e.target.value })}
          aria-label="Filtrar por grupo"
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los grupos</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
        {totalCount} contactos
      </span>
    </div>
  )
}
