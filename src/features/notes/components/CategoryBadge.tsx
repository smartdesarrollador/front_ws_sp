import type { NoteCategory } from '../types'

interface Props {
  category: NoteCategory | null
}

export function CategoryBadge({ category }: Props) {
  if (!category) return null
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: category.color + '20', color: category.color }}
    >
      {category.name}
    </span>
  )
}
