export interface AuditLogEntry {
  id: string
  user_name?: string
  user_email?: string
  action: string
  resource_type: string
  resource_id: string
  ip_address?: string
  user_agent?: string
  extra?: Record<string, unknown>
  created_at: string
}

export interface AuditLogFilters {
  action: string
  resource_type: string
  date_from: string
  date_to: string
  search: string
}

export interface AuditLogsPage {
  logs: AuditLogEntry[]
  pagination: { page: number; per_page: number; total: number; total_pages: number }
}
