import { Trash2 } from 'lucide-react'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDeleteItem } from '../hooks/useProjectItems'

interface Props {
  selectedIds: string[]
  projectId: string
  onClear: () => void
}

export function BatchActionsBar({ selectedIds, projectId, onClear }: Props) {
  const { hasFeature } = useFeatureGate()
  const deleteItem = useDeleteItem()

  if (!hasFeature('batch_actions')) {
    return null
  }

  const handleDeleteAll = () => {
    if (window.confirm(`¿Eliminar ${selectedIds.length} ítems seleccionados?`)) {
      selectedIds.forEach((itemId) => {
        deleteItem.mutate({ projectId, itemId })
      })
      onClear()
    }
  }

  return (
    <div
      data-testid="batch-actions-bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl px-4 py-3 shadow-xl"
    >
      <span className="text-sm font-medium">{selectedIds.length} seleccionados</span>
      <button
        onClick={handleDeleteAll}
        disabled={deleteItem.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Eliminar seleccionados
      </button>
      <button
        onClick={onClear}
        className="px-3 py-1.5 text-sm font-medium bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition-colors"
      >
        Cancelar
      </button>
    </div>
  )
}
