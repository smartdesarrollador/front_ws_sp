import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateSSLCert } from '../hooks/useCreateSSLCert'
import { useUpdateSSLCert } from '../hooks/useUpdateSSLCert'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { SSLCertificate } from '../types'

const schema = z.object({
  domain: z.string().min(1, 'El dominio es requerido'),
  issuer: z.string().optional(),
  valid_from: z.string().optional(),
  expires_at: z.string().min(1, 'La fecha de vencimiento es requerida'),
  auto_renew: z.boolean().default(false),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SSLCertModalProps {
  cert?: SSLCertificate | null
  onClose: () => void
}

export function SSLCertModal({ cert, onClose }: SSLCertModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)
  const isEditing = !!cert
  const createCert = useCreateSSLCert()
  const updateCert = useUpdateSSLCert()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      domain: '',
      issuer: '',
      valid_from: '',
      expires_at: '',
      auto_renew: false,
      notes: '',
    },
  })

  useEffect(() => {
    if (cert) {
      reset({
        domain: cert.domain,
        issuer: cert.issuer ?? '',
        valid_from: cert.valid_from ?? '',
        expires_at: cert.expires_at,
        auto_renew: cert.auto_renew,
        notes: cert.notes ?? '',
      })
    } else {
      reset({
        domain: '',
        issuer: '',
        valid_from: '',
        expires_at: '',
        auto_renew: false,
        notes: '',
      })
    }
  }, [cert, reset])

  const isPending = createCert.isPending || updateCert.isPending
  const error = createCert.error || updateCert.error

  const getPlanLimitError = (err: unknown) => {
    if (err && typeof err === 'object' && 'response' in err) {
      const res = (err as { response?: { status?: number; data?: { detail?: string } } }).response
      if (res?.status === 402) return res.data?.detail ?? 'Has alcanzado el límite de tu plan.'
    }
    return null
  }

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      issuer: values.issuer || undefined,
      valid_from: values.valid_from || undefined,
      notes: values.notes || undefined,
    }
    if (isEditing && cert) {
      updateCert.mutate({ id: cert.id, ...payload }, { onSuccess: onClose })
    } else {
      createCert.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ssl-cert-modal-title"
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="ssl-cert-modal-title" className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Certificado SSL' : 'Nuevo Certificado SSL'}
          </h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {getPlanLimitError(error) && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {getPlanLimitError(error)}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dominio <span className="text-red-500">*</span>
            </label>
            <input
              {...register('domain')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="example.com"
            />
            {errors.domain && (
              <p className="mt-1 text-xs text-red-600">{errors.domain.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emisor</label>
            <input
              {...register('issuer')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Let's Encrypt"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Válido desde</label>
              <input
                {...register('valid_from')}
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vence el <span className="text-red-500">*</span>
              </label>
              <input
                {...register('expires_at')}
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.expires_at && (
                <p className="mt-1 text-xs text-red-600">{errors.expires_at.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                {...register('auto_renew')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Renovación automática
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 flex items-center gap-2"
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
