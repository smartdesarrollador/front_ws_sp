import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, Pencil, Trash2 } from 'lucide-react'
import type { EnvVariable } from '../types'
import { EnvironmentBadge } from './EnvironmentBadge'

interface Props {
  envVar: EnvVariable
  onEdit: () => void
  onDelete: () => void
}

export function EnvVarRow({ envVar, onEdit, onDelete }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const displayValue = revealed ? envVar.value : '••••••••'

  const handleCopy = () => {
    navigator.clipboard.writeText(envVar.value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la variable "${envVar.key}"?`)) {
      onDelete()
    }
  }

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750">
      {/* Key */}
      <td className="px-4 py-3">
        <code className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
          {envVar.key}
        </code>
        {envVar.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">
            {envVar.description}
          </p>
        )}
      </td>

      {/* Environment */}
      <td className="px-4 py-3">
        <EnvironmentBadge environment={envVar.environment} />
      </td>

      {/* Value */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-gray-600 dark:text-gray-400">
            {displayValue}
          </code>
          <button
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Ocultar' : 'Revelar'}
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
          >
            {revealed ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            aria-label="Copiar valor"
            className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={onEdit}
            aria-label="Editar variable"
            className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Eliminar variable"
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}
