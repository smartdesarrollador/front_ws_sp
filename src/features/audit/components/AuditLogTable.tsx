import type { RefObject } from 'react'
import { AuditLogRow } from './AuditLogRow'
import type { AuditLogEntry } from '../types'

const COLUMNS = ['Timestamp', 'Actor', 'Acción', 'Recurso', 'ID', 'IP', 'Detalles']

interface Props {
  logs: AuditLogEntry[]
  isLoading: boolean
  isFetchingNextPage: boolean
  sentinelRef: RefObject<HTMLDivElement>
}

export function AuditLogTable({ logs, isLoading, isFetchingNextPage, sentinelRef }: Props) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <tr>
              {COLUMNS.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-100">
                    {COLUMNS.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : logs.length === 0
                ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-sm text-gray-400">
                      No hay registros de auditoría
                    </td>
                  </tr>
                )
                : logs.map((log) => <AuditLogRow key={log.id} log={log} />)}
          </tbody>
        </table>

        {/* Footer state */}
        {isFetchingNextPage && (
          <div className="px-4 py-3 text-center text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Cargando más...
            </span>
          </div>
        )}
      </div>

      {/* Scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
    </>
  )
}
