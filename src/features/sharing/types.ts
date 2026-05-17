export type ShareAccessLevel = 'viewer' | 'editor' | 'admin'

export interface SharedItem {
  id: string
  resource_type: string
  resource_id: string
  resource_name: string
  shared_by_name: string
  shared_by_email: string
  access_level: ShareAccessLevel
  message?: string
  expires_at?: string | null
  created_at: string
}

export interface ShareRecord {
  id: string
  resource_type: string
  resource_id: string
  shared_by_email: string
  shared_with_email: string
  shared_with_name: string
  permission_level: string
  is_inherited: boolean
  expires_at: string | null
  created_at: string
}
