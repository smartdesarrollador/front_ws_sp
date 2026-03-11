import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateEnvVar } from '../hooks/useCreateEnvVar'
import { useUpdateEnvVar } from '../hooks/useUpdateEnvVar'
import type { EnvVariable } from '../types'

const schema = z.object({
  key: z.string().min(1, 'El nombre es requerido'),
  value: z.string().min(1, 'El valor es requerido'),
  environment: z.enum(['dev', 'staging', 'production', 'all'] as const),
  description: z.string().optional(),
  is_encrypted: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  envVar?: EnvVariable | null
}

export function EnvVarModal({ onClose, envVar }: Props) {
  const createEnvVar = useCreateEnvVar()
  const updateEnvVar = useUpdateEnvVar()

  const isEditing = !!envVar

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: '',
      value: '',
      environment: 'dev',
      description: '',
      is_encrypted: false,
    },
  })

  useEffect(() => {
    reset(
      envVar
        ? {
            key: envVar.key,
            value: envVar.value,
            environment: envVar.environment,
            description: envVar.description ?? '',
            is_encrypted: envVar.is_encrypted,
          }
        : {
            key: '',
            value: '',
            environment: 'dev',
            description: '',
            is_encrypted: false,
          },
    )
  }, [envVar, reset])

  const onSubmit = (data: FormData) => {
    const payload = { ...data, key: data.key.toUpperCase() }
    if (isEditing) {
      updateEnvVar.mutate({ id: envVar.id, ...payload }, { onSuccess: onClose })
    } else {
      createEnvVar.mutate(payload, { onSuccess: onClose })
    }
  }

  const isPending = createEnvVar.isPending || updateEnvVar.isPending
  const error = createEnvVar.error || updateEnvVar.error

  const getErrorMessage = () => {
    if (!error) return null
    if ((error as { response?: { status?: number } }).response?.status === 402) {
      return 'Has alcanzado el límite de variables de entorno de tu plan'
    }
    return 'Ocurrió un error. Intenta de nuevo.'
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="envvar-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="envvar-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {isEditing ? 'Editar variable' : 'Nueva variable'}
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

          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la variable *
            </label>
            <input
              {...register('key')}
              disabled={isEditing}
              placeholder="DATABASE_URL"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            />
            {errors.key && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.key.message}</p>
            )}
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor *
            </label>
            <input
              {...register('value')}
              placeholder="Valor de la variable"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.value && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.value.message}</p>
            )}
          </div>

          {/* Environment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Entorno *
            </label>
            <select
              {...register('environment')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
              <option value="all">All</option>
            </select>
            {errors.environment && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.environment.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <input
              {...register('description')}
              placeholder="Descripción opcional..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Is Encrypted */}
          <div className="flex items-center gap-2">
            <input
              {...register('is_encrypted')}
              type="checkbox"
              id="envvar_is_encrypted"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="envvar_is_encrypted"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Cifrar valor
            </label>
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
