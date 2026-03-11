import { useState, useEffect, useRef } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuditLogs } from './hooks/useAuditLogs'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { AuditFilters, EMPTY_FILTERS } from './components/AuditFilters'
import { AuditLogTable } from './components/AuditLogTable'
import type { AuditLogFilters } from './types'

export default function AuditPage() {
  const { hasPermission } = usePermissions()
  const [filters, setFilters] = useState<AuditLogFilters>(EMPTY_FILTERS)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(sentinelRef, { threshold: 0.1 })

  const { logs, data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useAuditLogs(filters)

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  const total = data?.pages[0]?.pagination.total ?? 0

  if (!hasPermission('audit.view_auditlog')) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800 text-sm">
        Sin permiso de acceso al log de auditoría.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Log de Auditoría</h1>
        <span className="bg-gray-100 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {total}
        </span>
      </div>

      {/* Filters */}
      <AuditFilters
        filters={filters}
        onChange={setFilters}
        totalCount={isLoading ? undefined : total}
      />

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <AuditLogTable
          logs={logs}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          sentinelRef={sentinelRef}
        />
      </div>
    </div>
  )
}
