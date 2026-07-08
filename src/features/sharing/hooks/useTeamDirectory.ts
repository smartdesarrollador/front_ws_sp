import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export interface TeamDirectoryMember {
  id: string
  name: string
  email: string
}

export function useTeamDirectory() {
  return useQuery({
    queryKey: ['team-directory'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ members: TeamDirectoryMember[] }>(
        '/app/team/directory/',
      )
      return data.members
    },
    staleTime: 5 * 60_000,
  })
}
