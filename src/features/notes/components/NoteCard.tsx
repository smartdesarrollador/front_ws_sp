import { useState } from 'react'
import { Pin, Pencil, Trash2, Share2 } from 'lucide-react'
import type { Note } from '../types'
import { CATEGORY_COLORS } from '../types'
import { CategoryBadge } from './CategoryBadge'

interface Props {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onShare: (note: Note) => void
}

export function NoteCard({ note, onEdit, onDelete, onShare }: Props) {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = () => {
    if (confirming) {
      onDelete(note.id)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  const borderColor = CATEGORY_COLORS[note.category]

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow relative border-l-4"
      style={{ borderLeftColor: borderColor }}
    >
      {/* Pin icon top-right */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <Pin
          className={`w-4 h-4 ${
            note.is_pinned
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      </div>

      {/* Title */}
      <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate pr-6 mb-1">
        {note.title}
      </h2>

      {/* Content preview */}
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
        {note.content}
      </p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <CategoryBadge category={note.category} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(note.created_at).toLocaleDateString('es-ES')}
          </span>
          {/* Action buttons — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onShare(note)}
              aria-label="Compartir nota"
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(note)}
              aria-label="Editar nota"
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              aria-label={confirming ? 'Confirmar eliminación' : 'Eliminar nota'}
              className={`p-1 rounded ${
                confirming
                  ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
