export type ProjectStatus = 'active' | 'planning' | 'archived'

export type ProjectItemType =
  | 'credential' | 'link' | 'note' | 'config' | 'api_key' | 'email'

export type ProjectFieldType = 'password' | 'url' | 'email' | 'date' | 'text'

export type MemberRole = 'viewer' | 'editor' | 'admin'

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  color: string
  start_date?: string
  end_date?: string
  sections_count: number
  items_count: number
  members_count: number
  created_at: string
  updated_at: string
}

export interface ProjectItemField {
  id: string
  item_id: string
  field_name: string
  field_value: string
  field_type: ProjectFieldType
  is_encrypted: boolean
}

export interface ProjectItem {
  id: string
  section_id: string
  title: string
  description?: string
  type: ProjectItemType
  is_favorite: boolean
  expires_at?: string
  fields_count: number
  created_at: string
  updated_at: string
}

export interface ProjectSection {
  id: string
  project_id: string
  name: string
  description?: string
  color: string
  order: number
  items: ProjectItem[]
}

export interface ProjectDetail extends Project {
  sections: ProjectSection[]
}

export interface ProjectMember {
  id: string
  user_id: string
  project_id: string
  name: string
  email: string
  role: MemberRole
}

export interface CreateProjectRequest {
  name: string
  description?: string
  status?: ProjectStatus
  color?: string
  start_date?: string
  end_date?: string
}

export type UpdateProjectRequest = Partial<CreateProjectRequest>

export interface CreateSectionRequest {
  name: string
  description?: string
  color?: string
}

export interface CreateItemRequest {
  section_id: string
  title: string
  description?: string
  type: ProjectItemType
}

export interface CreateFieldRequest {
  field_name: string
  field_value: string
  field_type: ProjectFieldType
  is_encrypted?: boolean
}

export type UpdateFieldRequest = Partial<CreateFieldRequest>

export interface InviteMemberRequest {
  email: string
  role: MemberRole
}
