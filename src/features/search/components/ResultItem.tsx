import { useNavigate } from 'react-router-dom'
import { TYPE_ICONS } from '../types'
import type { SearchResultItem } from '../types'

interface Props {
  item: SearchResultItem
  query: string
}

/** Highlights every case-insensitive occurrence of `query` inside `text`. */
function highlight(text: string, query: string) {
  const q = query.trim()
  if (!q) return text
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'ig'))
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/50 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function ResultItem({ item, query }: Props) {
  const navigate = useNavigate()
  const Icon = TYPE_ICONS[item.type]

  return (
    <button
      type="button"
      onClick={() => navigate(item.url)}
      className="w-full flex items-start gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {highlight(item.title, query)}
        </p>
        {item.snippet && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {highlight(item.snippet, query)}
          </p>
        )}
      </div>
    </button>
  )
}
