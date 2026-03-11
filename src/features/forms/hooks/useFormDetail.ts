import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Form } from '../types'

export function useFormDetail(id: string | null) {
  return useQuery({
    queryKey: ['forms', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Form>(`/app/forms/${id}/`)
      return data
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}
