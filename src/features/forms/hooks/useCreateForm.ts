import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateFormRequest, Form } from '../types'

export function useCreateForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateFormRequest) => {
      const { data } = await apiClient.post<Form>('/app/forms/', payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms'] }),
  })
}
