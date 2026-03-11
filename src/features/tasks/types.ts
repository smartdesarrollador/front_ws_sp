export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'alta' | 'media' | 'baja'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  comment_count: number
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  content: string
  author: string
  created_at: string
}

export interface TaskFiltersState {
  search: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
}

export interface CreateTaskRequest {
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  due_date?: string | null
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>
