import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Key, Link, FileText, Settings, Zap, Mail } from 'lucide-react'
import { useCreateItem, useUpdateItem } from '../hooks/useProjectItems'
import type { ProjectItem, ProjectItemType } from '../types'

interface TypeOption {
  type: ProjectItemType
  label: string
  description: string
  icon: ReactNode
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: 'credential',
    label: 'Credencial',
    description: 'Usuario y contraseña',
    icon: <Key className="w-5 h-5" />,
  },
  {
    type: 'link',
    label: 'Enlace',
    description: 'URL o dirección web',
    icon: <Link className="w-5 h-5" />,
  },
  {
    type: 'note',
    label: 'Nota',
    description: 'Texto libre',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    type: 'config',
    label: 'Config',
    description: 'Variable de configuración',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    type: 'api_key',
    label: 'API Key',
    description: 'Clave de API',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Cuenta de correo',
    icon: <Mail className="w-5 h-5" />,
  },
]

const schema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  sectionId: string
  projectId: string
  item?: ProjectItem | null
  onClose: () => void
}

export function ItemModal({ sectionId, projectId, item, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(item ? 2 : 1)
  const [selectedType, setSelectedType] = useState<ProjectItemType>(item?.type ?? 'credential')

  const createItem = useCreateItem()
  const updateItem = useUpdateItem()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: item?.title ?? '',
      description: item?.description ?? '',
    },
  })

  const onSubmit = (data: FormData) => {
    if (item) {
      updateItem.mutate(
        { projectId, itemId: item.id, title: data.title, description: data.description },
        { onSuccess: onClose },
      )
    } else {
      createItem.mutate(
        {
          projectId,
          section_id: sectionId,
          title: data.title,
          description: data.description,
          type: selectedType,
        },
        { onSuccess: onClose },
      )
    }
  }

  const isPending = createItem.isPending || updateItem.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="item-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {item ? 'Editar ítem' : step === 1 ? 'Tipo de ítem' : 'Nuevo ítem'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Selecciona el tipo de ítem que deseas crear
            </p>
            <div className="grid grid-cols-3 gap-3">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(opt.type)
                    setStep(2)
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
                >
                  <span className="text-gray-600 dark:text-gray-400">{opt.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {!item && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-primary-600 dark:text-primary-400 hover:underline text-xs"
                >
                  ← Cambiar tipo
                </button>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  {TYPE_OPTIONS.find((o) => o.type === selectedType)?.label}
                </span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                {...register('title')}
                placeholder="Nombre del ítem"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.title && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Descripción opcional..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
                {item ? 'Guardar cambios' : 'Crear ítem'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
