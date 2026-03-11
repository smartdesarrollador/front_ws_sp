import { useState } from 'react'
import { Copy, Check, Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { ProjectItemField } from '../types'
import { FieldRevealToggle } from './FieldRevealButton'

interface Props {
  field: ProjectItemField
  projectId: string
  itemId: string
  onEdit: () => void
  onDelete: () => void
}

export function FieldCard({ field, projectId, itemId, onEdit, onDelete }: Props) {
  const [revealedValue, setRevealedValue] = useState('')
  const [copied, setCopied] = useState(false)

  const isEncrypted = field.is_encrypted
  const isRevealed = isEncrypted && !!revealedValue
  const displayValue = isEncrypted
    ? isRevealed
      ? revealedValue
      : '••••••••'
    : field.field_value

  const handleCopy = () => {
    const valueToCopy = isEncrypted ? revealedValue || field.field_value : field.field_value
    navigator.clipboard.writeText(valueToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleReveal = (value: string) => {
    setRevealedValue(value)
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
      {/* Field name */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {field.field_name}
        </span>
        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {isEncrypted && (
            <FieldRevealToggle
              projectId={projectId}
              itemId={itemId}
              fieldId={field.id}
              onReveal={handleReveal}
              revealed={isRevealed}
            />
          )}
          <button
            onClick={handleCopy}
            aria-label="Copiar valor"
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={onEdit}
            aria-label="Editar campo"
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`¿Eliminar el campo "${field.field_name}"?`)) onDelete()
            }}
            aria-label="Eliminar campo"
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Field value */}
      <div className="flex items-center gap-1.5">
        {field.field_type === 'url' ? (
          <a
            href={field.field_value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline truncate flex items-center gap-1"
          >
            {displayValue}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ) : field.field_type === 'email' ? (
          <a
            href={`mailto:${field.field_value}`}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline truncate"
          >
            {displayValue}
          </a>
        ) : (
          <span className="text-sm text-gray-900 dark:text-gray-100 font-mono truncate">
            {displayValue}
          </span>
        )}
      </div>
    </div>
  )
}
