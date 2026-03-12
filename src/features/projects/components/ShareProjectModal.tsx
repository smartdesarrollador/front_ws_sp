import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Trash2 } from 'lucide-react'
import { useProjectMembers, useInviteMember, useRemoveMember } from '../hooks/useProjectMembers'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { MemberRole } from '../types'

const schema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['viewer', 'editor', 'admin']),
})

type FormData = z.infer<typeof schema>

const ROLE_LABELS: Record<MemberRole, string> = {
  viewer: 'Lector',
  editor: 'Editor',
  admin: 'Admin',
}

interface Props {
  projectId: string
  onClose: () => void
}

export function ShareProjectModal({ projectId, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)
  const { data: members, isLoading } = useProjectMembers(projectId)
  const inviteMember = useInviteMember()
  const removeMember = useRemoveMember()
  const [inviteError, setInviteError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'viewer' },
  })

  const onSubmit = (data: FormData) => {
    setInviteError(null)
    inviteMember.mutate(
      { projectId, email: data.email, role: data.role },
      {
        onSuccess: () => reset(),
        onError: () => setInviteError('No se pudo invitar al miembro. Verifica el email.'),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="share-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Compartir proyecto
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Invitar miembro
            </h3>
            {inviteError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
                {inviteError}
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.email && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <select
                {...register('role')}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="viewer">Lector</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={inviteMember.isPending}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteMember.isPending ? 'Invitando...' : 'Invitar'}
            </button>
          </form>

          {/* Members list */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Miembros actuales
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                ))}
              </div>
            ) : (members ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay miembros aún.</p>
            ) : (
              <div className="space-y-2">
                {(members ?? []).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                        {ROLE_LABELS[member.role]}
                      </span>
                      <button
                        onClick={() => removeMember.mutate({ projectId, memberId: member.id })}
                        aria-label={`Eliminar ${member.name}`}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
