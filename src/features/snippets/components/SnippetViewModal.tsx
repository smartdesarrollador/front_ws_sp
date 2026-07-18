import { useRef } from 'react'
import { X, Copy, Check, Star, Share2 } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import LanguageBadge from './LanguageBadge'
import type { CodeSnippet } from '../types'

interface Props {
  snippet: CodeSnippet | null
  open: boolean
  onClose: () => void
}

export function SnippetViewModal({ snippet, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, open)

  const [titleCopied, copyTitle] = useCopyToClipboard()
  const [codeCopied, copyCode] = useCopyToClipboard()

  if (!open || !snippet) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="snippet-view-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            {snippet.is_favorite && (
              <Star
                className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0"
                aria-label="Snippet favorito"
              />
            )}
            <h2
              id="snippet-view-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {snippet.title}
            </h2>
            <button
              type="button"
              onClick={() => copyTitle(snippet.title)}
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <LanguageBadge language={snippet.language} />
            {snippet.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {snippet.is_shared && (
              <span
                title={
                  snippet.shared_by_name
                    ? `Compartido por ${snippet.shared_by_name}`
                    : 'Compartido contigo'
                }
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
              >
                <Share2 className="w-3 h-3" />
                Compartido
              </span>
            )}
          </div>

          {snippet.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{snippet.description}</p>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Código
              </label>
              <button
                type="button"
                onClick={() => copyCode(snippet.code)}
                aria-label="Copiar código"
                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
              >
                {codeCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <pre className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-all overflow-x-auto">
              {snippet.code}
            </pre>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Creado: {new Date(snippet.created_at).toLocaleDateString('es-ES')}</span>
            {snippet.updated_at !== snippet.created_at && (
              <span>Actualizado: {new Date(snippet.updated_at).toLocaleDateString('es-ES')}</span>
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
