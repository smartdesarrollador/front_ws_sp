import { AlertTriangle } from 'lucide-react'
import type { DashboardSummary } from '../types'

interface Props {
  usage: DashboardSummary['usage'] | undefined
  isLoading: boolean
}

function usagePercent(current: number, limit: number | null): number | null {
  if (limit === null || limit === 0) return null
  return Math.round((current / limit) * 100)
}

function barColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const BARS = [
  { label: 'Tareas', currentKey: 'tasks_active' as const, limitKey: 'tasks_limit' as const },
  { label: 'Proyectos', currentKey: 'projects' as const, limitKey: 'projects_limit' as const },
  { label: 'Notas', currentKey: 'notes' as const, limitKey: 'notes_limit' as const },
]

export function PlanUsageBanner({ usage, isLoading }: Props) {
  if (isLoading || !usage) return null

  // Only show banner if at least one limit is non-null
  const hasLimits = BARS.some(({ limitKey }) => usage[limitKey] !== null)
  if (!hasLimits) return null

  const isNearLimit = BARS.some(({ currentKey, limitKey }) => {
    const pct = usagePercent(usage[currentKey], usage[limitKey])
    return pct !== null && pct >= 80
  })

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Uso del plan</h2>
        {isNearLimit && (
          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Estás cerca del límite</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {BARS.map(({ label, currentKey, limitKey }) => {
          const current = usage[currentKey]
          const limit = usage[limitKey]
          const pct = usagePercent(current, limit)
          if (pct === null) return null

          return (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{label}</span>
                <span>
                  {current} / {limit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full ${barColor(pct)}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
