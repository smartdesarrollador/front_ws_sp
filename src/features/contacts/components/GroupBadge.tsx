import type { ContactGroup } from '../types'

interface GroupBadgeProps {
  group: ContactGroup | null
}

export function GroupBadge({ group }: GroupBadgeProps) {
  if (!group) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700 bg-gray-100"
      style={{ borderLeft: `3px solid ${group.color}` }}
    >
      {group.name}
    </span>
  )
}
