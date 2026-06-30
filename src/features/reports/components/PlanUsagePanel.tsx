import type { SummaryData, PlanUsage } from '../types'

interface Props {
  summary: SummaryData | undefined
  isLoading: boolean
}

function usagePercent(current: number, limit: number | null | undefined): number | null {
  if (limit === null || limit === undefined || limit === 0) return null
  return Math.round((current / limit) * 100)
}

function barColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

interface BarDef {
  label: string
  current: keyof PlanUsage
  limit: keyof PlanUsage
}

const BARS: BarDef[] = [
  { label: 'Tareas', current: 'tasks_active', limit: 'tasks_limit' },
  { label: 'Proyectos', current: 'projects', limit: 'projects_limit' },
  { label: 'Notas', current: 'notes', limit: 'notes_limit' },
  { label: 'Contactos', current: 'contacts', limit: 'contacts_limit' },
  { label: 'Bookmarks', current: 'bookmarks', limit: 'bookmarks_limit' },
  { label: 'Snippets', current: 'snippets', limit: 'snippets_limit' },
]

export function PlanUsagePanel({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  const usage = summary?.usage
  if (!usage) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos de uso disponibles
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {BARS.map(({ label, current, limit }) => {
        const currentValue = (usage[current] ?? 0) as number
        const limitValue = usage[limit] as number | null | undefined
        const pct = usagePercent(currentValue, limitValue)
        const unlimited = limitValue === null || limitValue === undefined

        return (
          <div key={label}>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{label}</span>
              <span>{unlimited ? `${currentValue} · ilimitado` : `${currentValue} / ${limitValue}`}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                role="progressbar"
                aria-valuenow={pct ?? currentValue}
                aria-valuemin={0}
                aria-valuemax={unlimited ? undefined : 100}
                aria-label={`${label}: ${currentValue}${unlimited ? '' : ` de ${limitValue}`}`}
                className={`h-2 rounded-full ${unlimited ? 'bg-blue-400' : barColor(pct ?? 0)}`}
                style={{ width: unlimited ? '100%' : `${Math.min(pct ?? 0, 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
