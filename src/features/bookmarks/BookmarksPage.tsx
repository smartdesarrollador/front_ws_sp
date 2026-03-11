import { useState } from 'react'
import { Plus, Bookmark, Download } from 'lucide-react'
import { useBookmarks } from './hooks/useBookmarks'
import { useCollections } from './hooks/useCollections'
import { useDeleteBookmark } from './hooks/useDeleteBookmark'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import FeatureGate from '@/components/shared/FeatureGate'
import { BookmarkFilters, EMPTY_FILTERS } from './components/BookmarkFilters'
import { BookmarkCard } from './components/BookmarkCard'
import { BookmarkModal } from './components/BookmarkModal'
import type { Bookmark as BookmarkType, BookmarkFiltersState } from './types'

export default function BookmarksPage() {
  const [showModal, setShowModal] = useState(false)
  const [bookmarkToEdit, setBookmarkToEdit] = useState<BookmarkType | null>(null)
  const [filters, setFilters] = useState<BookmarkFiltersState>(EMPTY_FILTERS)

  const { data, isLoading } = useBookmarks(filters)
  const { data: collections = [] } = useCollections()
  const deleteBookmark = useDeleteBookmark()
  const { data: summaryData } = useDashboardSummary()

  const allBookmarks = data?.bookmarks ?? []
  const total = data?.total ?? 0

  // Frontend filtering
  const filteredBookmarks = allBookmarks.filter((b) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matches =
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q)
      if (!matches) return false
    }
    if (filters.collection_id && b.collection?.id !== filters.collection_id) return false
    if (filters.tag && !b.tags.includes(filters.tag)) return false
    return true
  })

  // Plan limit banner
  const bookmarksCount = summaryData?.usage.bookmarks ?? 0
  const bookmarksLimit = summaryData?.usage.bookmarks_limit ?? null
  const showPlanBanner = bookmarksLimit !== null && bookmarksCount >= bookmarksLimit * 0.8

  const handleEdit = (bookmark: BookmarkType) => {
    setBookmarkToEdit(bookmark)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteBookmark.mutate(id)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setBookmarkToEdit(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookmarks</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Export with FeatureGate */}
          <FeatureGate
            feature="bookmarks_export"
            fallback={
              <button
                disabled
                title="Actualiza tu plan para exportar bookmarks"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            }
          >
            <button
              onClick={() => {
                const csvContent = [
                  ['Título', 'URL', 'Descripción', 'Colección', 'Tags', 'Favorito'].join(','),
                  ...filteredBookmarks.map((b) =>
                    [
                      b.title,
                      b.url,
                      b.description ?? '',
                      b.collection?.name ?? '',
                      b.tags.join(';'),
                      b.is_favorite ? 'Sí' : 'No',
                    ].join(','),
                  ),
                ].join('\n')
                const blob = new Blob([csvContent], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'bookmarks.csv'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </FeatureGate>

          <button
            onClick={() => {
              setBookmarkToEdit(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Bookmark
          </button>
        </div>
      </div>

      {/* Plan limit banner */}
      {showPlanBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Has alcanzado el {Math.round((bookmarksCount / (bookmarksLimit ?? 1)) * 100)}% del límite
          de bookmarks de tu plan ({bookmarksCount}/{bookmarksLimit}). Considera actualizar tu plan.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <BookmarkFilters
          filters={filters}
          onChange={setFilters}
          totalCount={total}
          collections={collections}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse h-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
            No hay bookmarks
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Guarda tu primer bookmark
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && <BookmarkModal bookmark={bookmarkToEdit} onClose={handleCloseModal} />}
    </div>
  )
}
