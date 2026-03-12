import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateBookmark } from '../hooks/useCreateBookmark'
import { useUpdateBookmark } from '../hooks/useUpdateBookmark'
import { useCollections } from '../hooks/useCollections'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Bookmark } from '../types'

const schema = z.object({
  url: z.string().min(1, 'La URL es requerida').url('URL inválida'),
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  description: z.string().optional(),
  collection: z.string().optional(),
  tags: z.string().optional(),
  is_favorite: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  bookmark?: Bookmark | null
  onClose: () => void
}

export function BookmarkModal({ bookmark, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)
  const createBookmark = useCreateBookmark()
  const updateBookmark = useUpdateBookmark()
  const { data: collections = [] } = useCollections()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: '',
      title: '',
      description: '',
      collection: '',
      tags: '',
      is_favorite: false,
    },
  })

  useEffect(() => {
    reset(
      bookmark
        ? {
            url: bookmark.url,
            title: bookmark.title,
            description: bookmark.description ?? '',
            collection: bookmark.collection?.id ?? '',
            tags: bookmark.tags.join(', '),
            is_favorite: bookmark.is_favorite,
          }
        : {
            url: '',
            title: '',
            description: '',
            collection: '',
            tags: '',
            is_favorite: false,
          },
    )
  }, [bookmark, reset])

  const onSubmit = (data: FormData) => {
    const parsedTags = data.tags
      ? data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    const payload = {
      url: data.url,
      title: data.title,
      description: data.description || undefined,
      collection: data.collection || null,
      tags: parsedTags,
      is_favorite: data.is_favorite ?? false,
    }

    if (bookmark) {
      updateBookmark.mutate({ id: bookmark.id, ...payload }, { onSuccess: onClose })
    } else {
      createBookmark.mutate(payload, { onSuccess: onClose })
    }
  }

  const isPending = createBookmark.isPending || updateBookmark.isPending
  const error = createBookmark.error || updateBookmark.error

  const getErrorMessage = () => {
    if (!error) return null
    if ((error as { response?: { status?: number } }).response?.status === 402) {
      return 'Has alcanzado el límite de bookmarks de tu plan'
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
        aria-labelledby="bookmark-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="bookmark-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {bookmark ? 'Editar bookmark' : 'Nuevo bookmark'}
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

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL *
            </label>
            <input
              {...register('url')}
              type="url"
              placeholder="https://..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.url && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.url.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              {...register('title')}
              placeholder="Nombre del bookmark"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Descripción opcional..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Collection and Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Colección
              </label>
              <select
                {...register('collection')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sin colección</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          {/* Is Favorite */}
          <div className="flex items-center gap-2">
            <input
              {...register('is_favorite')}
              type="checkbox"
              id="is_favorite"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="is_favorite"
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
              {bookmark ? 'Guardar cambios' : 'Crear bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
