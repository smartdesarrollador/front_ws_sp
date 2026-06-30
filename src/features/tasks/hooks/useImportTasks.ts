import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ImportSummary } from '@/components/shared/ImportModal'
import type { ParsedTask } from '@/lib/import'

export function useImportTasks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (items: ParsedTask[]): Promise<ImportSummary> => {
      const { data } = await apiClient.post<ImportSummary>('/app/tasks/import/', {
        items,
        source: 'file',
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
