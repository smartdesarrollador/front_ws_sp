import { useState } from 'react'
import { Plus, FileText, Pin, LayoutGrid, LayoutList } from 'lucide-react'
import { useNotes } from './hooks/useNotes'
import { useDeleteNote } from './hooks/useDeleteNote'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { NoteFilters } from './components/NoteFilters'
import { NoteCard } from './components/NoteCard'
import { NoteModal } from './components/NoteModal'
import type { Note, NoteFiltersState } from './types'

const EMPTY_FILTERS: NoteFiltersState = { search: '', category: '', pinned_only: false }

export default function NotesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [filters, setFilters] = useState<NoteFiltersState>(EMPTY_FILTERS)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data, isLoading } = useNotes(filters)
  const deleteNote = useDeleteNote()
  const { data: summaryData } = useDashboardSummary()

  const allNotes = data?.notes ?? []
  const total = data?.total ?? 0

  // Frontend filtering: search substring in title+content, exact category, pinned_only
  const filteredNotes = allNotes.filter((note) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matches =
        note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)
      if (!matches) return false
    }
    if (filters.category && note.category !== filters.category) return false
    if (filters.pinned_only && !note.is_pinned) return false
    return true
  })

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.is_pinned)

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

  const gridClass = 'grid grid-cols-1 lg:grid-cols-2 gap-4'
  const listClass = 'flex flex-col gap-4'

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

      {/* Plan limit banner */}
      {showPlanBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Has alcanzado el {Math.round((notesCount / (notesLimit ?? 1)) * 100)}% del límite de
          notas de tu plan ({notesCount}/{notesLimit}). Considera actualizar tu plan.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <NoteFilters filters={filters} onChange={setFilters} totalCount={total} />
      </div>

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
              <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
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
              <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <NoteModal note={editingNote} open={modalOpen} onClose={handleCloseModal} />
    </div>
  )
}
