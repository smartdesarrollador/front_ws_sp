import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { SummaryData } from '../types'

const COMPLETED_COLOR = '#22c55e'
const PENDING_COLOR = '#e5e7eb'

interface Props {
  summary: SummaryData | undefined
  isLoading: boolean
}

export function CompletionRateChart({ summary, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  const completed = summary?.completed_tasks ?? 0
  const active = summary?.active_tasks ?? 0
  const total = completed + active

  if (total === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  const rate = Math.round((completed / total) * 100)
  const data = [
    { name: 'Completadas', value: completed, color: COMPLETED_COLOR },
    { name: 'Pendientes', value: active, color: PENDING_COLOR },
  ]

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{rate}%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {completed} de {total}
        </span>
      </div>
    </div>
  )
}
