import { Search } from 'lucide-react'
import type { SnippetFiltersState } from '../types'
import { LANG_CONFIG } from './LanguageBadge'

export const EMPTY_FILTERS: SnippetFiltersState = { search: '', language: '', tag: '' }

interface Props {
  filters: SnippetFiltersState
  onChange: (f: SnippetFiltersState) => void
  totalCount: number
}

export function SnippetFilters({ filters, onChange, totalCount }: Props) {
  const isActive = filters.search !== '' || filters.language !== '' || filters.tag !== ''

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar snippets..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <select
        value={filters.language}
        onChange={(e) => onChange({ ...filters, language: e.target.value })}
        aria-label="Filtrar por lenguaje"
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Todos los lenguajes</option>
        {(Object.keys(LANG_CONFIG) as Array<keyof typeof LANG_CONFIG>).map((lang) => (
          <option key={lang} value={lang}>
            {LANG_CONFIG[lang].label}
          </option>
        ))}
      </select>
      {isActive && (
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
        {totalCount} snippets
      </span>
    </div>
  )
}
