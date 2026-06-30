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
import type { DevOpsReport, SnippetLanguage } from '../types'

// Brand-ish colors per language; unknown languages fall back to the palette by index.
const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  bash: '#4eaa25',
  sql: '#e38c00',
  html: '#e34f26',
  css: '#1572b6',
  json: '#a855f7',
  yaml: '#cb171e',
  dockerfile: '#2496ed',
  go: '#00add8',
  rust: '#dea584',
  java: '#f89820',
  other: '#6b7280',
}

const FALLBACK = '#a855f7'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: SnippetLanguage }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { language, count } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">
        {language}: {count}
      </p>
    </div>
  )
}

interface Props {
  devops: DevOpsReport | undefined
  isLoading: boolean
}

export function SnippetLanguageChart({ devops, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  const data = devops?.snippets_by_language ?? []

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin snippets registrados
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, bottom: 8, left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
        <YAxis type="category" dataKey="language" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {data.map((entry) => (
            <Cell key={entry.language} fill={LANGUAGE_COLORS[entry.language] ?? FALLBACK} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
