import { Share2, X } from 'lucide-react'

interface Props {
  count: number
  onShare: () => void
  onCancel: () => void
}

export function BulkActionBar({ count, onShare, onCancel }: Props) {
  return (
    <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-2.5">
      <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
        {count} seleccionada{count === 1 ? '' : 's'}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 rounded-lg"
        >
          <X className="w-3.5 h-3.5" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={onShare}
          disabled={count === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-3.5 h-3.5" />
          Compartir
        </button>
      </div>
    </div>
  )
}
