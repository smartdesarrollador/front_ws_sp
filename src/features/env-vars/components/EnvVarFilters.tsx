import type { EnvVarsFilters, EnvEnvironment } from '../types'

interface Props {
  filters: EnvVarsFilters
  onChange: (f: EnvVarsFilters) => void
  totalCount: number
}

export function EnvVarFilters({ filters, onChange, totalCount }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Variables de Entorno
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {totalCount} variables
        </span>
      </div>
      <div className="flex items-center gap-2 sm:ml-auto">
        <input
          type="text"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Buscar variable..."
          className="w-full sm:w-56 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filters.environment ?? ''}
          onChange={(e) =>
            onChange({ ...filters, environment: (e.target.value as EnvEnvironment | '') || '' })
          }
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Filtrar por entorno"
        >
          <option value="">Todos los entornos</option>
          <option value="dev">Development</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
          <option value="all">All</option>
        </select>
      </div>
    </div>
  )
}
