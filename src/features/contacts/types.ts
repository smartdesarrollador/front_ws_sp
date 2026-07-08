export interface ContactGroup {
  id: string
  name: string
  color: string
  contacts_count: number
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  group: ContactGroup | null
  notes?: string
  is_shared: boolean
  shared_by_name: string | null
  created_at: string
  updated_at: string
}

export interface ContactFiltersState {
  search: string
  group_id: string
}

export interface CreateContactRequest {
  name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  group?: string | null
  notes?: string
}

export type UpdateContactRequest = Partial<CreateContactRequest>
