import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SearchX } from 'lucide-react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { SearchInput } from './components/SearchInput'
import { AdvancedFilters } from './components/AdvancedFilters'
import { ResultGroup } from './components/ResultGroup'
import { useGlobalSearch, MIN_QUERY_LEN } from './hooks/useGlobalSearch'
import { EMPTY_FILTERS } from './types'
import type { SearchFiltersState } from './types'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [filters, setFilters] = useState<SearchFiltersState>(EMPTY_FILTERS)

  const debouncedQuery = useDebouncedValue(query, 300)
  const { data, isLoading, isError } = useGlobalSearch(debouncedQuery, filters)

  const handleQueryChange = (value: string) => {
    setQuery(value)
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const trimmed = debouncedQuery.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_QUERY_LEN
  const hasResults = (data?.total ?? 0) > 0
  const showEmpty = trimmed.length >= MIN_QUERY_LEN && !isLoading && !hasResults

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Buscar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Busca en todas tus secciones a la vez.
        </p>
      </div>

      <SearchInput value={query} onChange={handleQueryChange} />
      <AdvancedFilters filters={filters} onChange={setFilters} />

      {/* Prompt / hint */}
      {trimmed.length < MIN_QUERY_LEN && !tooShort && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-gray-500">
          <SearchIcon className="w-10 h-10 mb-3" />
          <p className="text-sm">Escribe al menos {MIN_QUERY_LEN} caracteres para buscar.</p>
        </div>
      )}

      {tooShort && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Escribe al menos {MIN_QUERY_LEN} caracteres.
        </p>
      )}

      {/* Loading skeleton */}
      {isLoading && trimmed.length >= MIN_QUERY_LEN && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Ocurrió un error al buscar. Inténtalo de nuevo.
        </p>
      )}

      {/* Empty results */}
      {showEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-gray-500">
          <SearchX className="w-10 h-10 mb-3" />
          <p className="text-sm">
            No se encontraron resultados para <span className="font-medium">«{trimmed}»</span>.
          </p>
        </div>
      )}

      {/* Results */}
      {hasResults && !isLoading && (
        <div className="space-y-4">
          {data!.groups.map((group) => (
            <ResultGroup key={group.type} group={group} query={trimmed} />
          ))}
        </div>
      )}
    </div>
  )
}
