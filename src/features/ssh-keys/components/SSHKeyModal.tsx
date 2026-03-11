import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Eye, EyeOff } from 'lucide-react'
import { useCreateSSHKey } from '../hooks/useCreateSSHKey'
import { useUpdateSSHKey } from '../hooks/useUpdateSSHKey'
import type { SSHKey } from '../types'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  algorithm: z.enum(['RSA', 'Ed25519', 'ECDSA', 'DSA'] as const),
  public_key: z.string().min(1, 'La clave pública es requerida'),
  private_key: z.string().optional(),
  description: z.string().optional(),
  expires_at: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  sshKey?: SSHKey | null
}

export function SSHKeyModal({ onClose, sshKey }: Props) {
  const createSSHKey = useCreateSSHKey()
  const updateSSHKey = useUpdateSSHKey()
  const [showPrivateKey, setShowPrivateKey] = useState(false)

  const isEditing = !!sshKey

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      algorithm: 'Ed25519',
      public_key: '',
      private_key: '',
      description: '',
      expires_at: '',
    },
  })

  useEffect(() => {
    reset(
      sshKey
        ? {
            name: sshKey.name,
            algorithm: sshKey.algorithm,
            public_key: sshKey.public_key,
            // Don't pre-fill private_key for security — don't re-expose
            private_key: '',
            description: sshKey.description ?? '',
            expires_at: sshKey.expires_at ?? '',
          }
        : {
            name: '',
            algorithm: 'Ed25519',
            public_key: '',
            private_key: '',
            description: '',
            expires_at: '',
          },
    )
  }, [sshKey, reset])

  const onSubmit = (data: FormData) => {
    // Strip empty optional fields
    const payload = {
      ...data,
      private_key: data.private_key || undefined,
      description: data.description || undefined,
      expires_at: data.expires_at || undefined,
    }

    if (isEditing) {
      updateSSHKey.mutate({ id: sshKey.id, ...payload }, { onSuccess: onClose })
    } else {
      createSSHKey.mutate(payload, { onSuccess: onClose })
    }
  }

  const isPending = createSSHKey.isPending || updateSSHKey.isPending
  const error = createSSHKey.error || updateSSHKey.error

  const getErrorMessage = () => {
    if (!error) return null
    if ((error as { response?: { status?: number } }).response?.status === 402) {
      return 'Has alcanzado el límite de claves SSH de tu plan'
    }
    return 'Ocurrió un error. Intenta de nuevo.'
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sshkey-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="sshkey-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {isEditing ? 'Editar clave SSH' : 'Nueva Clave SSH'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              {...register('name')}
              placeholder="Mi clave de despliegue"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Algorithm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Algoritmo *
            </label>
            <select
              {...register('algorithm')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Ed25519">Ed25519</option>
              <option value="RSA">RSA</option>
              <option value="ECDSA">ECDSA</option>
              <option value="DSA">DSA</option>
            </select>
            {errors.algorithm && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.algorithm.message}
              </p>
            )}
          </div>

          {/* Public Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Clave pública *
            </label>
            <textarea
              {...register('public_key')}
              rows={4}
              placeholder="ssh-ed25519 AAAA..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            {errors.public_key && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.public_key.message}
              </p>
            )}
          </div>

          {/* Private Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Clave privada{' '}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <input
                {...register('private_key')}
                type={showPrivateKey ? 'text' : 'password'}
                placeholder={isEditing ? 'Dejar vacío para no cambiar' : 'Pegar clave privada...'}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey((v) => !v)}
                aria-label={showPrivateKey ? 'Ocultar clave privada' : 'Mostrar clave privada'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              {...register('description')}
              placeholder="Descripción de la clave..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de expiración <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              {...register('expires_at')}
              type="date"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
