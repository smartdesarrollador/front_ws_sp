import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Bookmark, FolderOpen } from 'lucide-react'
import { apiClient } from '@/lib/axios'
import { useBookmarks } from './hooks/useBookmarks'
import { useCollections } from './hooks/useCollections'
import { useDeleteBookmark } from './hooks/useDeleteBookmark'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useImportBookmarks } from './hooks/useImportBookmarks'
import { useBookmarkTagSuggestions } from './hooks/useBookmarkTagSuggestions'
import ExportMenu, { type ExportFormat } from '@/components/shared/ExportMenu'
import ImportButton from '@/components/shared/ImportButton'
import ImportModal from '@/components/shared/ImportModal'
import Pagination from '@/components/shared/Pagination'
import FeatureGate from '@/components/shared/FeatureGate'
import { toCSV, toJSON, toBookmarksHTML, downloadBlob } from '@/lib/export'
import { parseBookmarks } from '@/lib/import'
import { BookmarkFilters, EMPTY_FILTERS } from './components/BookmarkFilters'
import { BookmarkCard } from './components/BookmarkCard'
import { BookmarkModal } from './components/BookmarkModal'
import { ManageCollectionsModal } from './components/ManageCollectionsModal'
import type { Bookmark as BookmarkType, BookmarkFiltersState } from './types'

interface AllBookmarksResponse {
  bookmarks: BookmarkType[]
}

export default function BookmarksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showModal, setShowModal] = useState(false)
  const [showCollectionsModal, setShowCollectionsModal] = useState(false)
  const [bookmarkToEdit, setBookmarkToEdit] = useState<BookmarkType | null>(null)
  const [filters, setFilters] = useState<BookmarkFiltersState>(EMPTY_FILTERS)
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1)

  const { data, isLoading } = useBookmarks(filters, page)
  const { data: collections = [] } = useCollections()
  const deleteBookmark = useDeleteBookmark()
  const importBookmarks = useImportBookmarks()
  const { data: summaryData } = useDashboardSummary()
  const { data: tagSuggestions } = useBookmarkTagSuggestions()

  const allBookmarks = data?.bookmarks ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? 0

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newPage <= 1) next.delete('page')
      else next.set('page', String(newPage))
      return next
    })
  }

  const handleFiltersChange = (f: BookmarkFiltersState) => {
    setFilters(f)
    handlePageChange(1)
  }

  const fetchAllBookmarksForExport = async () => {
    const params: Record<string, string> = {}
    if (filters.search) params.search = filters.search
    if (filters.collection_id) params.collection = filters.collection_id
    if (filters.tag) params.tag = filters.tag
    const { data: allData } = await apiClient.get<AllBookmarksResponse>('/app/bookmarks/', { params })
    return allData.bookmarks.filter((b) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matches =
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          (b.description ?? '').toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }

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

  const exportFormats: ExportFormat[] = [
    {
      id: 'html',
      label: 'HTML (navegador)',
      run: async () => {
        const bookmarks = await fetchAllBookmarksForExport()
        downloadBlob(
          new Blob(
            [toBookmarksHTML(bookmarks.map((b) => ({ title: b.title, url: b.url, tags: b.tags })))],
            { type: 'text/html;charset=utf-8' },
          ),
          'bookmarks.html',
        )
      },
    },
    {
      id: 'csv',
      label: 'CSV',
      run: async () => {
        const bookmarks = await fetchAllBookmarksForExport()
        downloadBlob(
          new Blob(
            [
              toCSV(bookmarks, [
                { label: 'Título', value: (b) => b.title },
                { label: 'URL', value: (b) => b.url },
                { label: 'Descripción', value: (b) => b.description ?? '' },
                { label: 'Colección', value: (b) => b.collection?.name ?? '' },
                { label: 'Tags', value: (b) => b.tags.join('; ') },
                { label: 'Favorito', value: (b) => (b.is_favorite ? 'Sí' : 'No') },
              ]),
            ],
            { type: 'text/csv;charset=utf-8' },
          ),
          'bookmarks.csv',
        )
      },
    },
    {
      id: 'json',
      label: 'JSON',
      run: async () => {
        const bookmarks = await fetchAllBookmarksForExport()
        downloadBlob(new Blob([toJSON(bookmarks)], { type: 'application/json' }), 'bookmarks.json')
      },
    },
  ]

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
          <ImportButton
            feature="bookmark_import"
            disabledHint="Actualiza tu plan para importar bookmarks"
            renderModal={(close) => (
              <ImportModal
                title="Importar bookmarks"
                accept=".html,.htm,.csv,.json"
                formatsHint="HTML del navegador, CSV o JSON"
                parse={parseBookmarks}
                columns={[
                  { label: 'Título', value: (b) => b.title ?? '' },
                  { label: 'URL', value: (b) => b.url ?? '' },
                ]}
                onImport={(items) => importBookmarks.mutateAsync(items)}
                onClose={close}
              />
            )}
          />
          <ExportMenu
            feature="bookmark_export"
            formats={exportFormats}
            disabledHint="Actualiza tu plan para exportar bookmarks"
          />

          <FeatureGate
            feature="bookmark_collections"
            fallback={
              <button
                disabled
                title="Actualiza tu plan para gestionar colecciones"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              >
                <FolderOpen className="w-4 h-4" />
                Gestionar colecciones
              </button>
            }
          >
            <button
              onClick={() => setShowCollectionsModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Gestionar colecciones
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
          onChange={handleFiltersChange}
          totalCount={total}
          collections={collections}
          tags={tagSuggestions ?? []}
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

      {!isLoading && pagination && (
        <Pagination
          page={pagination.page}
          perPage={pagination.per_page}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal */}
      {showModal && <BookmarkModal bookmark={bookmarkToEdit} onClose={handleCloseModal} />}
      {showCollectionsModal && (
        <ManageCollectionsModal onClose={() => setShowCollectionsModal(false)} />
      )}
    </div>
  )
}
