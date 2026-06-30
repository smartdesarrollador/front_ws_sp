export interface PlanUsage {
  tasks_active: number
  tasks_limit: number | null
  projects: number
  projects_limit: number | null
  notes: number
  notes_limit: number | null
  contacts?: number
  contacts_limit?: number | null
  bookmarks?: number
  bookmarks_limit?: number | null
  snippets?: number
  snippets_limit?: number | null
}

export interface SummaryData {
  active_tasks: number
  completed_tasks: number
  overdue_tasks?: number
  total_projects: number
  storage_used_gb: number
  usage?: PlanUsage
  tasks_growth?: number
  completed_growth?: number
  projects_growth?: number
  storage_growth?: number
}

export interface TaskByStatus {
  status: string
  count: number
}

export interface TaskByPriority {
  priority: string
  count: number
}

export interface OverdueTask {
  id: string
  title: string
  due_date: string
  priority: string
}

export interface UsageData {
  tasks_by_status: TaskByStatus[]
  tasks_by_priority: TaskByPriority[]
  overdue?: OverdueTask[]
}

export interface TrendPoint {
  date: string
  active_tasks: number
  completed_tasks: number
  new_projects: number
}

export interface TrendsData {
  period: string
  data: TrendPoint[]
}

// ── DevOps report (Fase 2) ───────────────────────────────────────────────────

export interface ExpiringCert {
  id: string
  domain: string
  valid_until: string | null
  days_until_expiry: number | null
}

export interface SSLSummary {
  valid: number
  expiring: number
  expired: number
  expiring_soon: ExpiringCert[]
}

export type StaleSecretType = 'env_var' | 'ssh_key' | 'vault_item'

export interface StaleSecret {
  type: StaleSecretType
  label: string
  updated_at: string
}

export interface SecretsSummary {
  env_vars: number
  ssh_keys: number
  vault_items: number
  stale: number
  stale_days: number
  oldest: StaleSecret[]
}

export interface SnippetLanguage {
  language: string
  count: number
}

export interface DevOpsReport {
  ssl: SSLSummary
  secrets: SecretsSummary
  snippets_by_language: SnippetLanguage[]
}

// ── Activity report (Fase 3) ─────────────────────────────────────────────────

export interface ActivityPoint {
  date: string
  count: number
}

export interface ActionCount {
  action: string
  count: number
}

export interface ActivityReport {
  period: string
  requested_days: number
  retention_days: number
  total: number
  by_day: ActivityPoint[]
  by_action: ActionCount[]
}
