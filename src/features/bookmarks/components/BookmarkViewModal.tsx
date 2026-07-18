import { useRef } from 'react'
import { X, Copy, Check, Star, ExternalLink } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { CollectionBadge } from './CollectionBadge'
import type { Bookmark } from '../types'

interface Props {
  bookmark: Bookmark | null
  open: boolean
  onClose: () => void
}

export function BookmarkViewModal({ bookmark, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, open)

  const [titleCopied, copyTitle] = useCopyToClipboard()
  const [urlCopied, copyUrl] = useCopyToClipboard()

  if (!open || !bookmark) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmark-view-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            {bookmark.is_favorite && (
              <Star
                className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0"
                aria-label="Bookmark favorito"
              />
            )}
            <h2
              id="bookmark-view-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {bookmark.title}
            </h2>
            <button
              type="button"
              onClick={() => copyTitle(bookmark.title)}
              aria-label="Copiar título"
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded flex-shrink-0"
            >
              {titleCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {(bookmark.collection || bookmark.tags.length > 0) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {bookmark.collection && <CollectionBadge collection={bookmark.collection} />}
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL
              </label>
              <button
                type="button"
                onClick={() => copyUrl(bookmark.url)}
                aria-label="Copiar URL"
                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
              >
                {urlCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 justify-between w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 break-all"
            >
              {bookmark.url}
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </a>
          </div>

          {bookmark.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{bookmark.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Creado: {new Date(bookmark.created_at).toLocaleDateString('es-ES')}</span>
            {bookmark.updated_at !== bookmark.created_at && (
              <span>Actualizado: {new Date(bookmark.updated_at).toLocaleDateString('es-ES')}</span>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
