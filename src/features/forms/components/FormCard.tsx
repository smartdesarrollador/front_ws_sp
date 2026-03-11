import { Pencil, Trash2, MessageSquare, ClipboardList } from 'lucide-react'
import type { Form } from '../types'
import FormStatusBadge from './FormStatusBadge'

interface Props {
  form: Form
  onEdit: (form: Form) => void
  onDelete: (id: string) => void
  onViewResponses: (formId: string) => void
}

export default function FormCard({ form, onEdit, onDelete, onViewResponses }: Props) {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el formulario "${form.title}"?`)) {
      onDelete(form.id)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-gray-900 truncate">{form.title}</span>
          <FormStatusBadge status={form.status} />
        </div>
        {form.description && (
          <p className="text-sm text-gray-500 truncate">{form.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {form.responses_count} respuestas
          </span>
          <span className="flex items-center gap-1">
            <ClipboardList className="w-3 h-3" />
            {form.questions.length} preguntas
          </span>
          {form.closes_at && (
            <span>Cierra: {new Date(form.closes_at).toLocaleDateString('es-ES')}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 ml-4 shrink-0">
        <button
          onClick={() => onViewResponses(form.id)}
          aria-label={`Ver respuestas de ${form.title}`}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(form)}
          aria-label={`Editar ${form.title}`}
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          aria-label={`Eliminar ${form.title}`}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
