export interface NoteCategory {
  id: string
  name: string
  color: string
  notes_count: number
}

export interface Note {
  id: string
  title: string
  content: string
  category: NoteCategory | null
  tags: string[]
  is_pinned: boolean
  is_shared: boolean
  shared_by_name: string | null
  created_at: string
  updated_at: string
}

export interface NoteFiltersState {
  search: string
  category: string
  pinned_only: boolean
  tag: string
}

export interface NotePagination {
  page: number
  per_page: number
  total: number
}

export interface CreateNoteRequest {
  title: string
  content: string
  category?: string | null
  tags?: string[]
  is_pinned?: boolean
}

export type UpdateNoteRequest = Partial<CreateNoteRequest>
