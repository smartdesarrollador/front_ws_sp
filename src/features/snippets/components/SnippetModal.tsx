import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateSnippet } from '../hooks/useCreateSnippet'
import { useUpdateSnippet } from '../hooks/useUpdateSnippet'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { LANG_CONFIG } from './LanguageBadge'
import type { CodeSnippet } from '../types'

const LANGUAGE_VALUES = [
  'javascript', 'typescript', 'python', 'bash',
  'sql', 'html', 'css', 'json', 'yaml',
  'dockerfile', 'go', 'rust', 'java', 'other',
] as const

const schema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  language: z.enum(LANGUAGE_VALUES),
  code: z.string().min(1, 'El código es requerido'),
  description: z.string().optional(),
  tags: z.string().optional(),
  is_favorite: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  snippet?: CodeSnippet | null
  onClose: () => void
}

export function SnippetModal({ snippet, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)
  const createSnippet = useCreateSnippet()
  const updateSnippet = useUpdateSnippet()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      language: 'javascript',
      code: '',
      description: '',
      tags: '',
      is_favorite: false,
    },
  })

  useEffect(() => {
    reset(
      snippet
        ? {
            title: snippet.title,
            language: snippet.language,
            code: snippet.code,
            description: snippet.description ?? '',
            tags: snippet.tags.join(', '),
            is_favorite: snippet.is_favorite,
          }
        : {
            title: '',
            language: 'javascript',
            code: '',
            description: '',
            tags: '',
            is_favorite: false,
          },
    )
  }, [snippet, reset])

  const onSubmit = (data: FormData) => {
    const parsedTags = data.tags
      ? data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    const payload = {
      title: data.title,
      language: data.language,
      code: data.code,
      description: data.description || undefined,
      tags: parsedTags,
      is_favorite: data.is_favorite ?? false,
    }

    if (snippet) {
      updateSnippet.mutate({ id: snippet.id, ...payload }, { onSuccess: onClose })
    } else {
      createSnippet.mutate(payload, { onSuccess: onClose })
    }
  }

  const isPending = createSnippet.isPending || updateSnippet.isPending
  const error = createSnippet.error || updateSnippet.error

  const getErrorMessage = () => {
    if (!error) return null
    if ((error as { response?: { status?: number } }).response?.status === 402) {
      return 'Has alcanzado el límite de snippets de tu plan'
    }
    return 'Ocurrió un error. Intenta de nuevo.'
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="snippet-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="snippet-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {snippet ? 'Editar snippet' : 'Nuevo snippet'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              {...register('title')}
              placeholder="Nombre del snippet"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lenguaje *
            </label>
            <select
              {...register('language')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {(Object.keys(LANG_CONFIG) as Array<keyof typeof LANG_CONFIG>).map((lang) => (
                <option key={lang} value={lang}>
                  {LANG_CONFIG[lang].label}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.language.message}
              </p>
            )}
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código *
            </label>
            <textarea
              {...register('code')}
              rows={8}
              placeholder="// Tu código aquí..."
              className="font-mono w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            {errors.code && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.code.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Descripción opcional..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <input
              {...register('tags')}
              placeholder="tag1, tag2, tag3"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Is Favorite */}
          <div className="flex items-center gap-2">
            <input
              {...register('is_favorite')}
              type="checkbox"
              id="snippet_is_favorite"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="snippet_is_favorite"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Marcar como favorito
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {snippet ? 'Guardar cambios' : 'Crear snippet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
