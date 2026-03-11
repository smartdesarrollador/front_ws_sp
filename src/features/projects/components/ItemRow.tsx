import { Star, AlertTriangle, Pencil, Trash2 } from 'lucide-react'
import type { ProjectItem, ProjectItemType } from '../types'

interface Props {
  item: ProjectItem
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

const TYPE_BADGE: Record<ProjectItemType, { label: string; className: string }> = {
  credential: {
    label: 'Credencial',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  link: {
    label: 'Enlace',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  note: {
    label: 'Nota',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  config: {
    label: 'Config',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  },
  api_key: {
    label: 'API Key',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  email: {
    label: 'Email',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
}

function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

export function ItemRow({ item, isSelected, onSelect, onEdit, onDelete }: Props) {
  const badge = TYPE_BADGE[item.type]
  const expiring = isExpiringSoon(item.expires_at)

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect() }}
    >
      <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${badge.className}`}>
        {badge.label}
      </span>
      <span className="text-sm truncate flex-1">{item.title}</span>
      {item.is_favorite && (
        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
      )}
      {expiring && (
        <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" aria-label="Próximo a vencer" />
      )}
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onEdit}
          aria-label="Editar ítem"
          className="p-0.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => {
            if (window.confirm(`¿Eliminar "${item.title}"?`)) onDelete()
          }}
          aria-label="Eliminar ítem"
          className="p-0.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
