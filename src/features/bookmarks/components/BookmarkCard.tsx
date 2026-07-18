import { useState } from 'react'
import { ExternalLink, Star, Pencil, Trash2, Copy, Check, Eye } from 'lucide-react'
import type { Bookmark } from '../types'
import { CollectionBadge } from './CollectionBadge'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

interface Props {
  bookmark: Bookmark
  onEdit: (b: Bookmark) => void
  onDelete: (id: string) => void
  onView: (b: Bookmark) => void
}

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

function getDomainColor(url: string): string {
  try {
    const domain = new URL(url).hostname
    const code = domain.charCodeAt(0) + (domain.charCodeAt(1) || 0)
    return PALETTE[code % PALETTE.length]
  } catch {
    return PALETTE[0]
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function BookmarkCard({ bookmark, onEdit, onDelete, onView }: Props) {
  const [faviconError, setFaviconError] = useState(false)
  const [copied, copy] = useCopyToClipboard()

  const domain = getDomain(bookmark.url)
  const domainColor = getDomainColor(bookmark.url)
  const firstLetter = domain[0]?.toUpperCase() ?? '?'

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el bookmark "${bookmark.title}"?`)) {
      onDelete(bookmark.id)
    }
  }

  const handleCopy = () => {
    copy(bookmark.url)
  }

  const FaviconPlaceholder = (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
      style={{ backgroundColor: domainColor }}
    >
      {firstLetter}
    </div>
  )

  const faviconEl =
    bookmark.favicon && !faviconError ? (
      <img
        src={bookmark.favicon}
        alt=""
        className="w-8 h-8 rounded-lg object-contain flex-shrink-0"
        onError={() => setFaviconError(true)}
      />
    ) : (
      FaviconPlaceholder
    )

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {faviconEl}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 truncate"
              >
                {bookmark.title}
              </a>
              <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
              {bookmark.is_favorite && (
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>

            {/* Action buttons — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onView(bookmark)}
                aria-label="Ver bookmark"
                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopy}
                aria-label="Copiar URL"
                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => onEdit(bookmark)}
                aria-label="Editar bookmark"
                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                aria-label="Eliminar bookmark"
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate overflow-hidden text-ellipsis">
            {bookmark.url}
          </p>

          {bookmark.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {bookmark.description}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {bookmark.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {bookmark.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Collection */}
      {bookmark.collection && (
        <div className="mt-2">
          <CollectionBadge collection={bookmark.collection} />
        </div>
      )}
    </div>
  )
}
