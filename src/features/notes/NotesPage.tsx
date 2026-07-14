import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, FileText, Pin, LayoutGrid, LayoutList, CheckSquare, FolderOpen } from 'lucide-react'
import { apiClient } from '@/lib/axios'
import { useNotes } from './hooks/useNotes'
import { useDeleteNote } from './hooks/useDeleteNote'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useImportNotes } from './hooks/useImportNotes'
import { useNoteTagSuggestions } from './hooks/useNoteTagSuggestions'
import { useCategories } from './hooks/useCategories'
import ExportMenu, { type ExportFormat } from '@/components/shared/ExportMenu'
import ImportButton from '@/components/shared/ImportButton'
import ImportModal from '@/components/shared/ImportModal'
import Pagination from '@/components/shared/Pagination'
import { toCSV, toJSON, toMarkdownZip, downloadBlob } from '@/lib/export'
import { parseNotesFile } from '@/lib/import'
import { NoteFilters } from './components/NoteFilters'
import { NoteCard } from './components/NoteCard'
import { NoteModal } from './components/NoteModal'
import { ManageCategoriesModal } from './components/ManageCategoriesModal'
import { ShareResourceModal } from '@/features/sharing/components/ShareResourceModal'
import { useBulkSelection } from '@/features/sharing/hooks/useBulkSelection'
import { BulkActionBar } from '@/features/sharing/components/BulkActionBar'
import type { Note, NoteFiltersState } from './types'

const EMPTY_FILTERS: NoteFiltersState = { search: '', category: '', pinned_only: false, tag: '' }

interface AllNotesResponse {
  notes: Note[]
}

export default function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [shareResources, setShareResources] = useState<{ id: string; title: string }[] | null>(null)
  const [filters, setFilters] = useState<NoteFiltersState>(EMPTY_FILTERS)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1)
  const bulk = useBulkSelection()

  const { data, isLoading } = useNotes(filters, page)
  const { data: categories = [] } = useCategories()
  const deleteNote = useDeleteNote()
  const importNotes = useImportNotes()
  const { data: summaryData } = useDashboardSummary()
  const { data: tagSuggestions } = useNoteTagSuggestions()

  const allNotes = data?.notes ?? []
  const pagination = data?.pagination

  // Frontend filtering: search substring in title+content, exact category, pinned_only
  const filteredNotes = allNotes.filter((note) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matches =
        note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)
      if (!matches) return false
    }
    if (filters.category && note.category?.id !== filters.category) return false
    if (filters.pinned_only && !note.is_pinned) return false
    if (filters.tag && !note.tags.includes(filters.tag)) return false
    return true
  })

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.is_pinned)
  const total = pinnedNotes.length + (pagination?.total ?? 0)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newPage <= 1) next.delete('page')
      else next.set('page', String(newPage))
      return next
    })
  }

  const handleFiltersChange = (f: NoteFiltersState) => {
    setFilters(f)
    handlePageChange(1)
  }

  const fetchAllNotesForExport = async () => {
    const params: Record<string, string> = {}
    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.tag) params.tag = filters.tag
    const { data: allData } = await apiClient.get<AllNotesResponse>('/app/notes/', { params })
    return allData.notes.filter((note) => {
      if (filters.pinned_only && !note.is_pinned) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!note.title.toLowerCase().includes(q) && !note.content.toLowerCase().includes(q)) return false
      }
      return true
    })
  }

  // Plan limit banner
  const notesCount = summaryData?.usage.notes ?? 0
  const notesLimit = summaryData?.usage.notes_limit ?? null
  const showPlanBanner = notesLimit !== null && notesCount >= notesLimit * 0.8

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteNote.mutate(id)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingNote(null)
  }

  const handleBulkShare = () => {
    const selected = filteredNotes
      .filter((n) => bulk.selectedIds.has(n.id))
      .map((n) => ({ id: n.id, title: n.title }))
    setShareResources(selected)
  }

  const handleCloseShareModal = () => {
    setShareResources(null)
    bulk.exitSelection()
  }

  const gridClass = 'grid grid-cols-1 lg:grid-cols-2 gap-4'
  const listClass = 'flex flex-col gap-4'

  const exportFormats: ExportFormat[] = [
    {
      id: 'md',
      label: 'Markdown (.zip)',
      run: async () => {
        const notes = await fetchAllNotesForExport()
        const blob = await toMarkdownZip(
          notes.map((n) => ({
            title: n.title,
            content: n.content,
            category: n.category?.name,
            tags: n.tags,
            created_at: n.created_at,
          })),
        )
        downloadBlob(blob, 'notas.zip')
      },
    },
    {
      id: 'json',
      label: 'JSON',
      run: async () => {
        const notes = await fetchAllNotesForExport()
        downloadBlob(new Blob([toJSON(notes)], { type: 'application/json' }), 'notas.json')
      },
    },
    {
      id: 'csv',
      label: 'CSV (metadatos)',
      run: async () => {
        const notes = await fetchAllNotesForExport()
        downloadBlob(
          new Blob(
            [
              toCSV(notes, [
                { label: 'Título', value: (n) => n.title },
                { label: 'Categoría', value: (n) => n.category?.name ?? '' },
                { label: 'Tags', value: (n) => n.tags.join('; ') },
                { label: 'Fijada', value: (n) => (n.is_pinned ? 'Sí' : 'No') },
                { label: 'Creada', value: (n) => n.created_at },
              ]),
            ],
            { type: 'text/csv;charset=utf-8' },
          ),
          'notas.csv',
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Organiza tus ideas y apuntes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportButton
            feature="notes_import"
            disabledHint="Actualiza tu plan para importar notas"
            renderModal={(close) => (
              <ImportModal
                title="Importar notas"
                accept=".zip,.json"
                formatsHint="Markdown (.zip) o JSON"
                parseFile={parseNotesFile}
                columns={[
                  { label: 'Título', value: (n) => n.title ?? '' },
                  { label: 'Categoría', value: (n) => n.category ?? '' },
                ]}
                onImport={(items) => importNotes.mutateAsync(items)}
                onClose={close}
              />
            )}
          />
          <ExportMenu
            feature="notes_export"
            formats={exportFormats}
            disabledHint="Actualiza tu plan para exportar notas"
          />
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Gestionar categorías
          </button>
          <button
            onClick={() => {
              setEditingNote(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Nota
          </button>
        </div>
      </div>

      {/* Plan limit banner */}
      {showPlanBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Has alcanzado el {Math.round((notesCount / (notesLimit ?? 1)) * 100)}% del límite de
          notas de tu plan ({notesCount}/{notesLimit}). Considera actualizar tu plan.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <NoteFilters
          filters={filters}
          onChange={handleFiltersChange}
          totalCount={total}
          categories={categories}
          tags={tagSuggestions ?? []}
        />
      </div>

      {/* Bulk selection toolbar */}
      {bulk.isSelecting ? (
        <BulkActionBar
          count={bulk.selectedIds.size}
          onShare={handleBulkShare}
          onCancel={bulk.exitSelection}
        />
      ) : (
        <div className="flex justify-end">
          <button
            onClick={bulk.toggleSelecting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <CheckSquare className="w-4 h-4" />
            Seleccionar
          </button>
        </div>
      )}

      {/* Pinned section — only when there are pinned notes and pinned_only filter is off */}
      {!filters.pinned_only && pinnedNotes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-yellow-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Notas fijadas
            </h2>
          </div>
          <div className={gridClass}>
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShare={(n) => setShareResources([{ id: n.id, title: n.title }])}
                selectionMode={bulk.isSelecting}
                selected={bulk.selectedIds.has(note.id)}
                onToggleSelect={bulk.toggleId}
              />
            ))}
          </div>
        </div>
      )}

      {/* All notes section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {filters.pinned_only ? 'Notas fijadas' : 'Notas'}
          </h2>
          {/* Grid / List toggle */}
          <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Vista cuadrícula"
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded ${
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="Vista lista"
              aria-pressed={viewMode === 'list'}
              className={`p-1.5 rounded ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={gridClass}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg h-36"
              />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
              No hay notas
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comienza creando tu primera nota
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? gridClass : listClass}>
            {(filters.pinned_only ? filteredNotes : unpinnedNotes).map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShare={(n) => setShareResources([{ id: n.id, title: n.title }])}
                selectionMode={bulk.isSelecting}
                selected={bulk.selectedIds.has(note.id)}
                onToggleSelect={bulk.toggleId}
              />
            ))}
          </div>
        )}

        {!isLoading && !filters.pinned_only && pagination && (
          <Pagination
            page={pagination.page}
            perPage={pagination.per_page}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <NoteModal note={editingNote} open={modalOpen} onClose={handleCloseModal} />
      {showCategoriesModal && (
        <ManageCategoriesModal onClose={() => setShowCategoriesModal(false)} />
      )}
      {shareResources && (
        <ShareResourceModal
          resourceType="note"
          resources={shareResources}
          onClose={handleCloseShareModal}
        />
      )}
    </div>
  )
}
