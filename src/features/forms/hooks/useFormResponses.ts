import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { FormResponse } from '../types'

interface FormResponsesResponse {
  responses: FormResponse[]
  total: number
}

export function useFormResponses(formId: string | null) {
  return useQuery({
    queryKey: ['form-responses', formId],
    queryFn: async () => {
      const { data } = await apiClient.get<FormResponsesResponse>(
        `/app/forms/${formId}/responses/`,
      )
      return data
    },
    select: (data) => ({ responses: data.responses, total: data.total }),
    staleTime: 30_000,
    enabled: !!formId,
  })
}
