import { Eye, Share2, Trash2 } from 'lucide-react'
import { VaultItemTypeBadge } from './VaultItemTypeBadge'
import type { VaultItem } from '../types'

interface VaultItemRowProps {
  item: VaultItem
  onReveal: (item: VaultItem) => void
  onDelete: (id: string) => void
  onShare: (item: VaultItem) => void
  isRevealing: boolean
}

export function VaultItemRow({ item, onReveal, onDelete, onShare, isRevealing }: VaultItemRowProps) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      <td className="px-4 py-3">
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.title}</span>
      </td>
      <td className="px-4 py-3">
        <VaultItemTypeBadge type={item.item_type} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onReveal(item)}
            disabled={isRevealing}
            aria-label="Ver / editar"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onShare(item)}
            aria-label="Compartir"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label="Eliminar"
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
