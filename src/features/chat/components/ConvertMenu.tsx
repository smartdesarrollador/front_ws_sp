import { FileText, UserPlus, Code2, Trash2 } from 'lucide-react'
import type { ConvertTarget } from '../types'

interface ConvertMenuProps {
  onConvert: (target: ConvertTarget) => void
  onDelete?: () => void
  disabled?: boolean
}

const OPTIONS: { target: ConvertTarget; label: string; icon: typeof FileText }[] = [
  { target: 'note', label: 'Convertir a Nota', icon: FileText },
  { target: 'contact', label: 'Convertir a Contacto', icon: UserPlus },
  { target: 'snippet', label: 'Convertir a Snippet', icon: Code2 },
]

export function ConvertMenu({ onConvert, onDelete, disabled = false }: ConvertMenuProps) {
  return (
    <div
      role="menu"
      className="absolute z-10 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
    >
      {OPTIONS.map(({ target, label, icon: Icon }) => (
        <button
          key={target}
          type="button"
          role="menuitem"
          disabled={disabled}
          onClick={() => onConvert(target)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
      {onDelete && (
        <>
          <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar mensaje
          </button>
        </>
      )}
    </div>
  )
}
