import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { downloadBlob } from '@/lib/export'

/**
 * Downloads the full workspace backup (ZIP) from the backend. The endpoint is
 * plan-gated (full_backup), excludes all secrets and is audited server-side.
 */
export function useWorkspaceBackup() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.get('/app/workspace/backup/', { responseType: 'blob' })
      downloadBlob(response.data as Blob, 'workspace-backup.zip')
    },
  })
}
