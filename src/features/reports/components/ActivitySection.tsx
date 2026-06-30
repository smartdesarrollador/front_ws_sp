import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import FeatureGate from '@/components/shared/FeatureGate'
import { useActivityReport, type ActivityPeriod } from '../hooks/useActivityReport'
import type { ActionCount } from '../types'

const PERIODS: ActivityPeriod[] = ['7d', '30d', '90d']

const ACTION_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#eab308', '#06b6d4', '#6b7280']

function formatDate(dateStr: string) {
  return dateStr.slice(-5)
}

/** "tasks.import" → "Tasks · import" (lightweight humanizer). */
function humanizeAction(action: string): string {
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/_/g, ' '))
    .join(' · ')
}

interface ActionTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ActionCount }>
}

function ActionTooltip({ active, payload }: ActionTooltipProps) {
  if (!active || !payload?.length) return null
  const { action, count } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">
        {humanizeAction(action)}: {count}
      </p>
    </div>
  )
}

function ActivityInner() {
  const [period, setPeriod] = useState<ActivityPeriod>('30d')
  const { activity, isLoading } = useActivityReport(period)

  const byDay = activity?.by_day ?? []
  const byAction = activity?.by_action ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activity ? `${activity.total} eventos en ${activity.period}` : 'Eventos de auditoría'}
        </p>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Actividad por día
          </h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ) : byDay.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Sin actividad</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={byDay} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip labelFormatter={(v) => formatDate(String(v))} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Eventos" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By action */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Por tipo de acción
          </h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ) : byAction.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Sin actividad</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byAction} layout="vertical" margin={{ top: 8, right: 8, bottom: 8, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="action"
                  tick={{ fontSize: 11 }}
                  tickFormatter={humanizeAction}
                  width={120}
                />
                <Tooltip content={<ActionTooltip />} />
                <Bar dataKey="count">
                  {byAction.map((entry, i) => (
                    <Cell key={entry.action} fill={ACTION_COLORS[i % ACTION_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export function ActivitySection() {
  return (
    <FeatureGate feature="audit_logs">
      <ActivityInner />
    </FeatureGate>
  )
}
