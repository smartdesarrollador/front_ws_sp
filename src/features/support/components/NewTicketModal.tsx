import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, X } from 'lucide-react'
import { useCreateTicket } from '../hooks/useCreateTicket'
import type { NewTicketRequest } from '../types'

const schema = z.object({
  subject: z.string().min(5, 'Minimo 5 caracteres'),
  category: z.enum(['billing', 'technical', 'account', 'general']),
  priority: z.enum(['urgente', 'alta', 'media', 'baja']),
  description: z.string().min(20, 'Minimo 20 caracteres'),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export function NewTicketModal({ open, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const createTicket = useCreateTicket()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) {
      setStep(1)
      reset()
    }
  }, [open, reset])

  const onSubmit = (data: FormData) => {
    createTicket.mutate(data as NewTicketRequest, {
      onSuccess: () => {
        setStep(2)
        setTimeout(() => {
          onClose()
          reset()
          setStep(1)
        }, 1500)
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nuevo ticket de soporte</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  {...register('subject')}
                  placeholder="Describe brevemente el problema..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.subject && (
                  <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  {...register('category')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Categoria --</option>
                  <option value="billing">Facturacion</option>
                  <option value="technical">Tecnico</option>
                  <option value="account">Cuenta</option>
                  <option value="general">General</option>
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  {...register('priority')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Prioridad --</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
                {errors.priority && (
                  <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe el problema en detalle..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createTicket.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {createTicket.isPending && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {createTicket.isPending ? 'Enviando...' : 'Enviar ticket'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">Ticket enviado</h2>
            <p className="text-sm text-gray-500 mt-1">Nos pondremos en contacto pronto.</p>
          </div>
        )}
      </div>
    </div>
  )
}
