import type { NoteCategory } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'

interface Props {
  category: NoteCategory
}

export function CategoryBadge({ category }: Props) {
  const color = CATEGORY_COLORS[category]
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: color + '20', color }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
