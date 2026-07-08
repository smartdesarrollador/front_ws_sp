import { Eye, Share2 } from 'lucide-react'
import { VaultItemTypeBadge } from './VaultItemTypeBadge'
import type { SharedVaultItem } from '../types'

interface SharedVaultItemRowProps {
  item: SharedVaultItem
  onReveal: (item: SharedVaultItem) => void
  isRevealing: boolean
}

export function SharedVaultItemRow({ item, onReveal, isRevealing }: SharedVaultItemRowProps) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.title}</span>
          <span
            title={`Compartido por ${item.shared_by_name}`}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
          >
            <Share2 className="w-3 h-3" />
            Compartido
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <VaultItemTypeBadge type={item.item_type} />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onReveal(item)}
          disabled={isRevealing}
          aria-label="Ver"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Eye className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}
