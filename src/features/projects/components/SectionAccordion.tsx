import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react'
import type { ProjectSection, ProjectItem } from '../types'
import { ItemRow } from './ItemRow'

interface Props {
  section: ProjectSection
  isExpanded: boolean
  onToggle: () => void
  selectedItemId?: string | null
  onSelectItem: (item: ProjectItem) => void
  onAddItem: () => void
  onEditSection: () => void
  onDeleteSection: () => void
}

export function SectionAccordion({
  section,
  isExpanded,
  onToggle,
  selectedItemId,
  onSelectItem,
  onAddItem,
  onEditSection,
  onDeleteSection,
}: Props) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle() }}
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        )}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: section.color || '#6b7280' }}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
          {section.name}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
          {section.items.length}
        </span>
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEditSection}
            aria-label="Editar sección"
            className="p-0.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`¿Eliminar la sección "${section.name}"?`)) onDeleteSection()
            }}
            aria-label="Eliminar sección"
            className="p-0.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Section body */}
      {isExpanded && (
        <div className="p-2 space-y-0.5">
          {section.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onSelect={() => onSelectItem(item)}
              onEdit={() => {/* handled by parent */}}
              onDelete={() => {/* handled by parent */}}
            />
          ))}
          <button
            onClick={onAddItem}
            className="flex items-center gap-1.5 w-full px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <Plus className="w-3 h-3" />
            Agregar ítem
          </button>
        </div>
      )}
    </div>
  )
}
