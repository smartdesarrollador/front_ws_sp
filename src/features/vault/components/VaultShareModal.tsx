import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Trash2 } from 'lucide-react'
import { useItemShares, useShareVaultItem, useRevokeVaultShare } from '../hooks/useVaultSharing'
import { useTeamDirectory } from '@/features/sharing/hooks/useTeamDirectory'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const schema = z.object({
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

interface Props {
  itemId: string
  itemTitle: string
  onClose: () => void
}

export function VaultShareModal({ itemId, itemTitle, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)

  const { data: shares = [], isLoading } = useItemShares(itemId)
  const { data: teammates = [] } = useTeamDirectory()
  const shareItem = useShareVaultItem()
  const revokeShare = useRevokeVaultShare()
  const [shareError, setShareError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  const onSubmit = (data: FormData) => {
    setShareError(null)
    shareItem.mutate(
      { itemId, email: data.email },
      {
        onSuccess: () => reset(),
        onError: (error) => {
          const responseStatus = (error as { response?: { status?: number } }).response?.status
          const code = (error as { response?: { data?: { error?: { code?: string } } } }).response
            ?.data?.error?.code
          if (responseStatus === 402) {
            setShareError('Para compartir necesitas un plan superior. Actualiza tu plan para desbloquear esta función.')
          } else if (code === 'recipient_no_vault_key') {
            setShareError('El destinatario debe configurar su Bóveda antes de poder recibir un ítem compartido.')
          } else if (code === 'self_share') {
            setShareError('No puedes compartir un ítem contigo mismo.')
          } else if (responseStatus === 404) {
            setShareError('No existe ningún usuario con ese email.')
          } else {
            setShareError('No se pudo compartir. Verifica el email.')
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
        aria-labelledby="vault-share-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2
              id="vault-share-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Compartir elemento
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {itemTitle}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Compartir con
            </h3>
            {shareError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
                {shareError}
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
            <div>
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
            <button
              type="submit"
              disabled={shareItem.isPending}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shareItem.isPending ? 'Compartiendo...' : 'Compartir'}
            </button>
          </form>

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
                    <button
                      onClick={() => revokeShare.mutate({ itemId, shareId: share.id })}
                      aria-label={`Revocar acceso de ${share.shared_with_name}`}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
