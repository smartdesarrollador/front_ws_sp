export type SnippetLanguage =
  | 'javascript' | 'typescript' | 'python' | 'bash'
  | 'sql' | 'html' | 'css' | 'json' | 'yaml'
  | 'dockerfile' | 'go' | 'rust' | 'java' | 'other'

export interface CodeSnippet {
  id: string
  title: string
  description?: string
  code: string
  language: SnippetLanguage
  tags: string[]
  is_favorite: boolean
  usage_count?: number
  is_shared: boolean
  shared_by_name: string | null
  created_at: string
  updated_at: string
}

export interface SnippetFiltersState {
  search: string
  language: string
  tag: string
}

export interface CreateSnippetRequest {
  title: string
  code: string
  language: SnippetLanguage
  description?: string
  tags?: string[]
  is_favorite?: boolean
}

export type UpdateSnippetRequest = Partial<CreateSnippetRequest>
