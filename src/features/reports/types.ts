export interface SummaryData {
  active_tasks: number
  completed_tasks: number
  total_projects: number
  storage_used_gb: number
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

export interface UsageData {
  tasks_by_status: TaskByStatus[]
  tasks_by_priority: TaskByPriority[]
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
