import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Form, FormFilters } from '../types'

interface FormsResponse {
  forms: Form[]
  total: number
}

export function useForms(filters: FormFilters = {}) {
  return useQuery({
    queryKey: ['forms', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search
      const { data } = await apiClient.get<FormsResponse>('/app/forms/', { params })
      return data
    },
    select: (data) => ({ forms: data.forms, total: data.total }),
    staleTime: 30_000,
  })
}
