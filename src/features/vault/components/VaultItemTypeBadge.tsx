import { VAULT_TYPES } from '../itemTypes'
import type { VaultItemType } from '../types'

export function VaultItemTypeBadge({ type }: { type: VaultItemType }) {
  const meta = VAULT_TYPES[type]
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  )
}
