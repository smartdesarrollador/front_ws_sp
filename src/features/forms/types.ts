export type FormStatus = 'draft' | 'active' | 'closed'

export type QuestionType = 'text' | 'rating' | 'multiple_choice' | 'boolean'

export interface FormQuestion {
  id: string
  text: string
  type: QuestionType
  required: boolean
  order: number
}

export interface Form {
  id: string
  title: string
  description: string
  status: FormStatus
  questions: FormQuestion[]
  responses_count: number
  closes_at: string | null
  public_url?: string
  created_at: string
  updated_at: string
}

export interface FormResponse {
  id: string
  respondent_name?: string
  respondent_email?: string
  answers: Record<string, unknown>
  submitted_at: string
}

export interface CreateFormRequest {
  title: string
  description: string
  status: FormStatus
  questions: Omit<FormQuestion, 'id'>[]
  closes_at?: string | null
}

export interface UpdateFormRequest extends Partial<CreateFormRequest> {
  id: string
}

export interface FormFilters {
  status?: FormStatus
  search?: string
}
