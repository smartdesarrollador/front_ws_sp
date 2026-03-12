import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Trash2 } from 'lucide-react'
import { useCreateForm } from '../hooks/useCreateForm'
import { useUpdateForm } from '../hooks/useUpdateForm'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Form, QuestionType } from '../types'

const schema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']),
  closes_at: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface QuestionDraft {
  localId: string
  text: string
  type: QuestionType
  required: boolean
}

interface Props {
  form?: Form | null
  onClose: () => void
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Texto libre' },
  { value: 'rating', label: 'Valoración' },
  { value: 'multiple_choice', label: 'Opción múltiple' },
  { value: 'boolean', label: 'Sí / No' },
]

export default function FormModal({ form, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)
  const isEdit = !!form
  const createForm = useCreateForm()
  const updateForm = useUpdateForm()
  const isPending = createForm.isPending || updateForm.isPending
  const error = createForm.error || updateForm.error

  const [questions, setQuestions] = useState<QuestionDraft[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft' },
  })

  useEffect(() => {
    if (form) {
      reset({
        title: form.title,
        description: form.description,
        status: form.status,
        closes_at: form.closes_at ? form.closes_at.slice(0, 10) : '',
      })
      setQuestions(
        form.questions.map((q) => ({
          localId: q.id,
          text: q.text,
          type: q.type,
          required: q.required,
        })),
      )
    } else {
      reset({ title: '', description: '', status: 'draft', closes_at: '' })
      setQuestions([])
    }
  }, [form, reset])

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { localId: crypto.randomUUID(), text: '', type: 'text', required: false },
    ])
  }

  const updateQuestion = (localId: string, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) => prev.map((q) => (q.localId === localId ? { ...q, ...patch } : q)))
  }

  const removeQuestion = (localId: string) => {
    setQuestions((prev) => prev.filter((q) => q.localId !== localId))
  }

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title,
      description: values.description ?? '',
      status: values.status,
      closes_at: values.closes_at || null,
      questions: questions.map((q, idx) => ({
        text: q.text,
        type: q.type,
        required: q.required,
        order: idx,
      })),
    }
    if (isEdit && form) {
      updateForm.mutate({ id: form.id, ...payload }, { onSuccess: onClose })
    } else {
      createForm.mutate(payload, { onSuccess: onClose })
    }
  }

  const is402 = (error as { response?: { status?: number } })?.response?.status === 402

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 id="form-modal-title" className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar formulario' : 'Nuevo formulario'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* 402 banner */}
            {is402 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Has alcanzado el límite de formularios de tu plan.
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mi formulario"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Descripción opcional"
              />
            </div>

            {/* Status + closes_at */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  {...register('status')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de cierre
                </label>
                <input
                  {...register('closes_at')}
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Preguntas</label>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir pregunta
                </button>
              </div>
              {questions.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                  Sin preguntas aún
                </p>
              )}
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div
                    key={q.localId}
                    className="flex gap-2 items-start p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <span className="text-xs text-gray-400 mt-2 min-w-[20px]">{idx + 1}.</span>
                    <div className="flex-1 space-y-2">
                      <input
                        value={q.text}
                        onChange={(e) => updateQuestion(q.localId, { text: e.target.value })}
                        placeholder="Texto de la pregunta"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-3">
                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(q.localId, { type: e.target.value as QuestionType })
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {QUESTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) =>
                              updateQuestion(q.localId, { required: e.target.checked })
                            }
                            className="rounded"
                          />
                          Obligatoria
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.localId)}
                      aria-label="Eliminar pregunta"
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear formulario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
