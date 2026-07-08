import { useState } from 'react'
import { Star, Pencil, Trash2, Copy, Check, Share2 } from 'lucide-react'
import type { CodeSnippet } from '../types'
import LanguageBadge from './LanguageBadge'

interface Props {
  snippet: CodeSnippet
  onEdit: (s: CodeSnippet) => void
  onDelete: (id: string) => void
  onShare: (s: CodeSnippet) => void
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

export function SnippetCard({
  snippet,
  onEdit,
  onDelete,
  onShare,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el snippet "${snippet.title}"?`)) {
      onDelete(snippet.id)
    }
  }

  const codePreview = snippet.code.length > 200 ? snippet.code.slice(0, 200) + '…' : snippet.code

  return (
    <div
      onClick={selectionMode ? () => onToggleSelect?.(snippet.id) : undefined}
      className={`group bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow ${
        selectionMode ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-primary-400 dark:border-primary-600 ring-2 ring-primary-200 dark:ring-primary-900'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {selectionMode && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect?.(snippet.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Seleccionar ${snippet.title}`}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
            />
          )}
          <LanguageBadge language={snippet.language} />
          {snippet.is_favorite && (
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
          {snippet.is_shared && (
            <span
              title={
                snippet.shared_by_name
                  ? `Compartido por ${snippet.shared_by_name}`
                  : 'Compartido contigo'
              }
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
            >
              <Share2 className="w-3 h-3" />
              Compartido
            </span>
          )}
        </div>

        {/* Action buttons — visible on hover, hidden in selection mode */}
        {!selectionMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={handleCopy}
              aria-label="Copiar código"
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => onShare(snippet)}
              aria-label="Compartir snippet"
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(snippet)}
              aria-label="Editar snippet"
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              aria-label="Eliminar snippet"
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
        {snippet.title}
      </h3>

      {/* Description */}
      {snippet.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {snippet.description}
        </p>
      )}

      {/* Code preview */}
      <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded p-2 overflow-hidden whitespace-pre-wrap break-all mb-2">
        {codePreview}
      </pre>

      {/* Tags */}
      {snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {snippet.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
