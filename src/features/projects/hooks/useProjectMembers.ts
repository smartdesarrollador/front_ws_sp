import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ProjectMember, InviteMemberRequest } from '../types'

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['members', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProjectMember[]>(
        `/app/projects/${projectId}/members/`,
      )
      return data
    },
    enabled: !!projectId,
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      ...data
    }: InviteMemberRequest & { projectId: string }) => {
      const response = await apiClient.post<ProjectMember>(
        `/app/projects/${projectId}/members/`,
        data,
      )
      return response.data
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] })
    },
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      memberId,
    }: {
      projectId: string
      memberId: string
    }) => {
      await apiClient.delete(`/app/projects/${projectId}/members/${memberId}/`)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] })
    },
  })
}
