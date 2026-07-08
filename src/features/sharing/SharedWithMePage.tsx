import { useState, useMemo } from 'react'
import { Share2, Search } from 'lucide-react'
import { useSharedWithMe } from './hooks/useSharedWithMe'
import { SharedItemCard } from './components/SharedItemCard'
import type { ShareAccessLevel } from './types'

type ResourceTypeFilter = 'all' | 'project' | 'note' | 'snippet' | 'contact'
type AccessLevelFilter = 'all' | ShareAccessLevel

// Mantener en sync con Share.RESOURCE_TYPES (apps/backend_django/apps/sharing/models.py):
// solo project, section, item, snippet, note y contact son compartibles.
const RESOURCE_TYPE_OPTIONS: { value: ResourceTypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'project', label: 'Proyectos' },
  { value: 'snippet', label: 'Snippets' },
  { value: 'note', label: 'Notas' },
  { value: 'contact', label: 'Contactos' },
]

const ACCESS_LEVEL_PILLS: { value: AccessLevelFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'viewer', label: 'Visualizador' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Administrador' },
]

export default function SharedWithMePage() {
  const [search, setSearch] = useState('')
  const [resourceType, setResourceType] = useState<ResourceTypeFilter>('all')
  const [accessLevel, setAccessLevel] = useState<AccessLevelFilter>('all')

  const { data, isLoading } = useSharedWithMe()

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const filteredItems = useMemo(() => {
    let result = items

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.resource_name.toLowerCase().includes(q) ||
          item.shared_by_name.toLowerCase().includes(q),
      )
    }

    if (resourceType !== 'all') {
      result = result.filter((item) => item.resource_type === resourceType)
    }

    if (accessLevel !== 'all') {
      result = result.filter((item) => item.access_level === accessLevel)
    }

    return result
  }, [items, search, resourceType, accessLevel])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Compartido Conmigo</h1>
        <span className="bg-gray-100 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {total}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o usuario..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Resource type select */}
        <select
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value as ResourceTypeFilter)}
          aria-label="Filtrar por tipo de recurso"
          className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {RESOURCE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Access level pills */}
      <div className="flex gap-1.5 flex-wrap">
        {ACCESS_LEVEL_PILLS.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setAccessLevel(pill.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              accessLevel === pill.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-5 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <Share2 className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm font-medium text-gray-500">Nada compartido contigo aún</p>
          <p className="text-xs mt-1">
            Cuando alguien comparta algo contigo, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <SharedItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
