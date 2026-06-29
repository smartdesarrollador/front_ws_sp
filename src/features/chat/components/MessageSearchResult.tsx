import { Avatar } from './Avatar'
import { relativeTime } from '../utils'
import type { ChatMessageSearchResult } from '../types'

interface Props {
  result: ChatMessageSearchResult
  query: string
  onSelect: (conversationId: string) => void
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Highlights every case-insensitive occurrence of `query` in `text`. */
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

export function MessageSearchResult({ result, query, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result.conversation_id)}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <Avatar name={result.conversation_name} color="blue" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {result.conversation_name}
          </p>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {relativeTime(result.created_at)}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          <span className="text-gray-400">{result.sender_name}: </span>
          {highlight(result.snippet, query)}
        </p>
      </div>
    </button>
  )
}
