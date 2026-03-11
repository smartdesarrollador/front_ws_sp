import { Pencil, Trash2, Folder, Users, Layers } from 'lucide-react'
import type { Project, ProjectStatus } from '../types'

interface Props {
  project: Project
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

const STATUS_BADGE: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  active: {
    label: 'Activo',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  planning: {
    label: 'Planificación',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  archived: {
    label: 'Archivado',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  },
}

export function ProjectCard({ project, onSelect, onEdit, onDelete }: Props) {
  const badge = STATUS_BADGE[project.status]

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el proyecto "${project.name}"? Se perderán todas sus secciones e ítems.`)) {
      onDelete()
    }
  }

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect() }}
    >
      {/* Left color accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: project.color }}
      />

      <div className="pl-4 pr-4 pt-4 pb-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: project.color }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {project.name}
            </h3>
          </div>

          {/* Action buttons — visible on hover */}
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              aria-label="Editar proyecto"
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              aria-label="Eliminar proyecto"
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status badge */}
        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${badge.className}`}>
          {badge.label}
        </span>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {project.sections_count} secciones
          </span>
          <span className="flex items-center gap-1">
            <Folder className="w-3 h-3" />
            {project.items_count} ítems
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project.members_count}
          </span>
        </div>
      </div>
    </div>
  )
}
