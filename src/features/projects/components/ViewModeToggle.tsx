import { LayoutList, Grid2X2 } from 'lucide-react'

interface Props {
  mode: 'list' | 'grid'
  onChange: (m: 'list' | 'grid') => void
}

export function ViewModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
      <button
        onClick={() => onChange('list')}
        aria-label="Vista de lista"
        aria-pressed={mode === 'list'}
        className={`p-1.5 rounded transition-colors ${
          mode === 'list'
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        <LayoutList className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('grid')}
        aria-label="Vista de cuadrícula"
        aria-pressed={mode === 'grid'}
        className={`p-1.5 rounded transition-colors ${
          mode === 'grid'
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        <Grid2X2 className="w-4 h-4" />
      </button>
    </div>
  )
}
