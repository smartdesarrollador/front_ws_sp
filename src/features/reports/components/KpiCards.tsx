import { CheckSquare, CheckCheck, FolderOpen, AlertTriangle } from 'lucide-react'
import type { SummaryData } from '../types'

interface Props {
  summary: SummaryData | undefined
  isLoading: boolean
}

interface KpiCardProps {
  title: string
  value: string
  icon: React.ReactNode
  colorClass: string
  growth?: number
}

function KpiCard({ title, value, icon, colorClass, growth }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colorClass} mb-3`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {growth !== undefined && growth !== 0 && (
        <p
          className={`text-xs mt-1 font-medium ${
            growth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {growth > 0 ? `↑ +${growth}%` : `↓ ${growth}%`}
        </p>
      )}
    </div>
  )
}

export function KpiCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-32 rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (!summary) return null

  const overdue = summary.overdue_tasks ?? 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Tareas Activas"
        value={String(summary.active_tasks)}
        icon={<CheckSquare className="h-5 w-5 text-white" />}
        colorClass="bg-blue-500"
        growth={summary.tasks_growth}
      />
      <KpiCard
        title="Tareas Completadas"
        value={String(summary.completed_tasks)}
        icon={<CheckCheck className="h-5 w-5 text-white" />}
        colorClass="bg-green-500"
        growth={summary.completed_growth}
      />
      <KpiCard
        title="Proyectos Activos"
        value={String(summary.total_projects)}
        icon={<FolderOpen className="h-5 w-5 text-white" />}
        colorClass="bg-purple-500"
        growth={summary.projects_growth}
      />
      <KpiCard
        title="Tareas Vencidas"
        value={String(overdue)}
        icon={<AlertTriangle className="h-5 w-5 text-white" />}
        colorClass={overdue > 0 ? 'bg-red-500' : 'bg-gray-400'}
      />
    </div>
  )
}
