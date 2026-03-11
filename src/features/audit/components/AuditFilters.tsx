import { Search } from 'lucide-react'
import type { AuditLogFilters } from '../types'

export const EMPTY_FILTERS: AuditLogFilters = {
  action: '',
  resource_type: '',
  date_from: '',
  date_to: '',
  search: '',
}

function isActive(filters: AuditLogFilters): boolean {
  return Object.values(filters).some((v) => v !== '')
}

const ACTION_OPTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'create', label: 'Crear' },
  { value: 'update', label: 'Actualizar' },
  { value: 'delete', label: 'Eliminar' },
  { value: 'login', label: 'Inicio de sesión' },
  { value: 'logout', label: 'Cierre de sesión' },
  { value: 'reveal', label: 'Revelar' },
  { value: 'assign', label: 'Asignar' },
  { value: 'revoke', label: 'Revocar' },
]

interface Props {
  filters: AuditLogFilters
  onChange: (f: AuditLogFilters) => void
  totalCount?: number
}

export function AuditFilters({ filters, onChange, totalCount }: Props) {
  function handleChange(field: keyof AuditLogFilters, value: string) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Buscar..."
          aria-label="Buscar en auditoría"
          className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <select
        value={filters.action}
        onChange={(e) => handleChange('action', e.target.value)}
        aria-label="Filtrar por acción"
        className="rounded-lg border border-gray-200 bg-white text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {ACTION_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.resource_type}
        onChange={(e) => handleChange('resource_type', e.target.value)}
        aria-label="Filtrar por recurso"
        className="rounded-lg border border-gray-200 bg-white text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Todos los recursos</option>
        <option value="user">Usuario</option>
        <option value="role">Rol</option>
        <option value="permission">Permiso</option>
        <option value="project">Proyecto</option>
        <option value="task">Tarea</option>
        <option value="note">Nota</option>
        <option value="bookmark">Bookmark</option>
      </select>

      <input
        type="date"
        value={filters.date_from}
        onChange={(e) => handleChange('date_from', e.target.value)}
        aria-label="Fecha desde"
        className="rounded-lg border border-gray-200 bg-white text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <input
        type="date"
        value={filters.date_to}
        onChange={(e) => handleChange('date_to', e.target.value)}
        aria-label="Fecha hasta"
        className="rounded-lg border border-gray-200 bg-white text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {isActive(filters) && (
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar filtros
        </button>
      )}

      {totalCount !== undefined && (
        <span className="ml-auto text-sm text-gray-500">{totalCount} eventos</span>
      )}
    </div>
  )
}
