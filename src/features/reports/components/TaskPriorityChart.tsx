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
import type { UsageData, TaskByPriority } from '../types'

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

export const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

const DEFAULT_COLOR = '#a855f7'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TaskByPriority }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { priority, count } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">
        {PRIORITY_LABELS[priority] ?? priority}: {count}
      </p>
    </div>
  )
}

interface Props {
  usage: UsageData | undefined
  isLoading: boolean
}

export function TaskPriorityChart({ usage, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  if (!usage?.tasks_by_priority?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={usage.tasks_by_priority}
        layout="vertical"
        margin={{ top: 8, right: 8, bottom: 8, left: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="priority"
          tick={{ fontSize: 12 }}
          tickFormatter={(v: string) => PRIORITY_LABELS[v] ?? v}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {usage.tasks_by_priority.map((entry) => (
            <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? DEFAULT_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
