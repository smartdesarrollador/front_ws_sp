import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export function useDeleteForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/app/forms/${id}/`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms'] }),
  })
}
