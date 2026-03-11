import type { BookmarkCollection } from '../types'

interface CollectionBadgeProps {
  collection: BookmarkCollection | null
}

export function CollectionBadge({ collection }: CollectionBadgeProps) {
  if (!collection) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700 bg-gray-100"
      style={{ borderLeft: `3px solid ${collection.color}` }}
    >
      {collection.name}
    </span>
  )
}
