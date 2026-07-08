import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Trash2 } from 'lucide-react'
import { useResourceShares } from '../hooks/useResourceShares'
import { useCreateShare } from '../hooks/useCreateShare'
import { useRevokeShare } from '../hooks/useRevokeShare'
import { useTeamDirectory } from '../hooks/useTeamDirectory'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const PERMISSION_LABELS: Record<string, string> = {
  viewer: 'Lector',
  editor: 'Editor',
  admin: 'Admin',
}

const RESOURCE_LABELS: Record<string, string> = {
  snippet: 'snippet',
  note: 'nota',
  contact: 'contacto',
}

const schema = z.object({
  email: z.string().email('Email inválido'),
  permission_level: z.enum(['viewer', 'editor', 'admin']),
})

type FormData = z.infer<typeof schema>

interface Props {
  resourceType: 'snippet' | 'note' | 'contact'
  resourceId: string
  resourceTitle: string
  onClose: () => void
}

export function ShareResourceModal({ resourceType, resourceId, resourceTitle, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)

  const { data: shares = [], isLoading } = useResourceShares(resourceType, resourceId)
  const { data: teammates = [] } = useTeamDirectory()
  const createShare = useCreateShare()
  const revokeShare = useRevokeShare()
  const [inviteError, setInviteError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', permission_level: 'viewer' },
  })

  const onSubmit = (data: FormData) => {
    setInviteError(null)
    createShare.mutate(
      {
        resource_type: resourceType,
        resource_id: resourceId,
        shared_with_email: data.email,
        permission_level: data.permission_level,
      },
      {
        onSuccess: () => reset(),
        onError: (error) => {
          if ((error as { response?: { status?: number } }).response?.status === 402) {
            setInviteError('Para compartir necesitas un plan superior. Actualiza tu plan para desbloquear esta función.')
          } else {
            setInviteError('No se pudo compartir. Verifica el email.')
          }
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-resource-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2
              id="share-resource-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Compartir {RESOURCE_LABELS[resourceType]}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {resourceTitle}
            </p>
          </div>
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
              Compartir con
            </h3>
            {inviteError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
                {inviteError}
              </div>
            )}
            {teammates.length > 0 && (
              <select
                aria-label="Elegir del equipo"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    setValue('email', e.target.value, { shouldValidate: true })
                    e.target.value = ''
                  }
                }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Elegir del equipo…</option>
                {teammates.map((member) => (
                  <option key={member.id} value={member.email}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
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
                {...register('permission_level')}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="viewer">Lector</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={createShare.isPending}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createShare.isPending ? 'Compartiendo...' : 'Compartir'}
            </button>
          </form>

          {/* Current shares list */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Con acceso
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                ))}
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nadie tiene acceso aún.
              </p>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {share.shared_with_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {share.shared_with_email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                        {PERMISSION_LABELS[share.permission_level] ?? share.permission_level}
                      </span>
                      <button
                        onClick={() =>
                          revokeShare.mutate({
                            shareId: share.id,
                            resourceType,
                            resourceId,
                          })
                        }
                        aria-label={`Revocar acceso de ${share.shared_with_name}`}
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
