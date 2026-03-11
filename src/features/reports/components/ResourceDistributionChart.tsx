import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { UsageData, TaskByStatus } from '../types'

export const STATUS_COLORS: Record<string, string> = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  in_review: '#f97316',
  done: '#22c55e',
}

const DEFAULT_COLOR = '#a855f7'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TaskByStatus }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { status, count } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">
        {status}: {count}
      </p>
    </div>
  )
}

interface Props {
  usage: UsageData | undefined
  isLoading: boolean
}

export function ResourceDistributionChart({ usage, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  if (!usage?.tasks_by_status?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={usage.tasks_by_status}
        layout="vertical"
        margin={{ top: 8, right: 8, bottom: 8, left: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="status" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {usage.tasks_by_status.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] ?? DEFAULT_COLOR}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
