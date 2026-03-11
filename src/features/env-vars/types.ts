export type EnvEnvironment = 'dev' | 'staging' | 'production' | 'all'

export interface EnvVariable {
  id: string
  key: string
  value: string
  description?: string
  environment: EnvEnvironment
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

export interface EnvVarsFilters {
  search?: string
  environment?: EnvEnvironment | ''
}

export interface CreateEnvVarRequest {
  key: string
  value: string
  description?: string
  environment: EnvEnvironment
  is_encrypted?: boolean
}

export type UpdateEnvVarRequest = Partial<CreateEnvVarRequest>
