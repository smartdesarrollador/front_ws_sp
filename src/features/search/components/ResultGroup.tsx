import { TYPE_ICONS } from '../types'
import type { SearchGroup } from '../types'
import { ResultItem } from './ResultItem'

interface Props {
  group: SearchGroup
  query: string
}

export function ResultGroup({ group, query }: Props) {
  const Icon = TYPE_ICONS[group.type]
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <Icon className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{group.label}</h2>
        <span className="badge bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {group.count}
        </span>
      </header>
      <div className="p-1.5">
        {group.results.map((item) => (
          <ResultItem key={`${item.type}-${item.id}`} item={item} query={query} />
        ))}
      </div>
    </section>
  )
}
