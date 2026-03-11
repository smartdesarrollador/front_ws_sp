import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateFormRequest, Form } from '../types'

export function useUpdateForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateFormRequest) => {
      const { data } = await apiClient.patch<Form>(`/app/forms/${id}/`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms'] }),
  })
}
