export interface DashboardSummary {
  active_tasks: number
  total_projects: number
  total_notes: number
  events_today: number
  usage: {
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
}

export interface RecentTask {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'alta' | 'media' | 'baja'
  due_date: string | null
  updated_at: string
}

export interface UpcomingEvent {
  id: string
  title: string
  start_datetime: string
  end_datetime: string
  color: string | null
  all_day: boolean
}

export interface RecentActivity {
  recentTasks: RecentTask[]
  upcomingEvents: UpcomingEvent[]
  isLoading: boolean
}
