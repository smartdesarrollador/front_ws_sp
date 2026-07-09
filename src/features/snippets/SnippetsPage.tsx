import { useState } from 'react'
import { Plus, Code2, CheckSquare } from 'lucide-react'
import { useSnippets } from './hooks/useSnippets'
import { useDeleteSnippet } from './hooks/useDeleteSnippet'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useSnippetTagSuggestions } from './hooks/useSnippetTagSuggestions'
import ExportMenu, { type ExportFormat } from '@/components/shared/ExportMenu'
import { toJSON, toCodeZip, downloadBlob } from '@/lib/export'
import { SnippetFilters, EMPTY_FILTERS } from './components/SnippetFilters'
import { SnippetCard } from './components/SnippetCard'
import { SnippetModal } from './components/SnippetModal'
import { ShareResourceModal } from '@/features/sharing/components/ShareResourceModal'
import { useBulkSelection } from '@/features/sharing/hooks/useBulkSelection'
import { BulkActionBar } from '@/features/sharing/components/BulkActionBar'
import type { CodeSnippet, SnippetFiltersState } from './types'

export default function SnippetsPage() {
  const [showModal, setShowModal] = useState(false)
  const [snippetToEdit, setSnippetToEdit] = useState<CodeSnippet | null>(null)
  const [shareResources, setShareResources] = useState<{ id: string; title: string }[] | null>(null)
  const [filters, setFilters] = useState<SnippetFiltersState>(EMPTY_FILTERS)
  const bulk = useBulkSelection()

  const { data, isLoading } = useSnippets(filters)
  const deleteSnippet = useDeleteSnippet()
  const { data: summaryData } = useDashboardSummary()
  const { data: tagSuggestions } = useSnippetTagSuggestions()

  const allSnippets = data?.snippets ?? []
  const total = data?.total ?? 0

  // Frontend filtering
  const filteredSnippets = allSnippets.filter((s) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matches =
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q)
      if (!matches) return false
    }
    if (filters.language && s.language !== filters.language) return false
    if (filters.tag && !s.tags.includes(filters.tag)) return false
    return true
  })

  // Plan limit banner
  const snippetsCount = summaryData?.usage.snippets ?? 0
  const snippetsLimit = summaryData?.usage.snippets_limit ?? null
  const showPlanBanner = snippetsLimit !== null && snippetsCount >= snippetsLimit * 0.8

  const handleEdit = (snippet: CodeSnippet) => {
    setSnippetToEdit(snippet)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteSnippet.mutate(id)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSnippetToEdit(null)
  }

  const handleBulkShare = () => {
    const selected = filteredSnippets
      .filter((s) => bulk.selectedIds.has(s.id))
      .map((s) => ({ id: s.id, title: s.title }))
    setShareResources(selected)
  }

  const handleCloseShareModal = () => {
    setShareResources(null)
    bulk.exitSelection()
  }

  const exportFormats: ExportFormat[] = [
    {
      id: 'zip',
      label: 'Archivos de código (.zip)',
      run: async () => {
        const blob = await toCodeZip(
          filteredSnippets.map((s) => ({ title: s.title, code: s.code, language: s.language })),
        )
        downloadBlob(blob, 'snippets.zip')
      },
    },
    {
      id: 'json',
      label: 'JSON',
      run: () =>
        downloadBlob(new Blob([toJSON(filteredSnippets)], { type: 'application/json' }), 'snippets.json'),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Snippets</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            feature="snippets_export"
            formats={exportFormats}
            disabledHint="Actualiza tu plan para exportar snippets"
          />

          <button
            onClick={() => {
              setSnippetToEdit(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Snippet
          </button>
        </div>
      </div>

      {/* Plan limit banner */}
      {showPlanBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Has alcanzado el {Math.round((snippetsCount / (snippetsLimit ?? 1)) * 100)}% del límite
          de snippets de tu plan ({snippetsCount}/{snippetsLimit}). Considera actualizar tu plan.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <SnippetFilters
          filters={filters}
          onChange={setFilters}
          totalCount={total}
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

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse h-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : filteredSnippets.length === 0 ? (
        <div className="text-center py-16">
          <Code2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
            No hay snippets
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Guarda tu primer snippet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={(s) => setShareResources([{ id: s.id, title: s.title }])}
              selectionMode={bulk.isSelecting}
              selected={bulk.selectedIds.has(snippet.id)}
              onToggleSelect={bulk.toggleId}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && <SnippetModal snippet={snippetToEdit} onClose={handleCloseModal} />}
      {shareResources && (
        <ShareResourceModal
          resourceType="snippet"
          resources={shareResources}
          onClose={handleCloseShareModal}
        />
      )}
    </div>
  )
}
