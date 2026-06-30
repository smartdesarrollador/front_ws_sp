import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ImportSummary } from '@/components/shared/ImportModal'
import type { ParsedBookmark } from '@/lib/import'

export function useImportBookmarks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (items: ParsedBookmark[]): Promise<ImportSummary> => {
      const { data } = await apiClient.post<ImportSummary>('/app/bookmarks/import/', {
        items,
        source: 'file',
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
