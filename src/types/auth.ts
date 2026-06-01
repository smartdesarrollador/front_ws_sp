export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  email_verified: boolean
  permissions: string[]
  roles: string[]
  mfa_enabled?: boolean
  last_login?: string
  created_at?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  subdomain: string
  primary_color?: string
  plan?: string
  logo_url?: string | null
  favicon_url?: string | null
}

export type LoginResult = { ok: true } | { mfaRequired: true; mfaToken: string }

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
  tenant: Tenant
}

export interface MFALoginResponse {
  mfa_required: true
  mfa_token: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  organization_name: string
}
