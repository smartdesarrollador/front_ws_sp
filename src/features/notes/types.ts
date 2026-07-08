export type NoteCategory = 'work' | 'personal' | 'ideas' | 'archive'

export const CATEGORY_COLORS: Record<NoteCategory, string> = {
  work:     '#3b82f6',
  personal: '#10b981',
  ideas:    '#f59e0b',
  archive:  '#6b7280',
}

export const CATEGORY_LABELS: Record<NoteCategory, string> = {
  work:     'Trabajo',
  personal: 'Personal',
  ideas:    'Ideas',
  archive:  'Archivo',
}

export interface Note {
  id: string
  title: string
  content: string
  category: NoteCategory
  tags: string[]
  is_pinned: boolean
  is_shared: boolean
  shared_by_name: string | null
  created_at: string
  updated_at: string
}

export interface NoteFiltersState {
  search: string
  category: NoteCategory | ''
  pinned_only: boolean
}

export interface CreateNoteRequest {
  title: string
  content: string
  category: NoteCategory
  tags?: string[]
  is_pinned?: boolean
}

export type UpdateNoteRequest = Partial<CreateNoteRequest>
