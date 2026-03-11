import { X } from 'lucide-react'
import { useFormDetail } from '../hooks/useFormDetail'
import { useFormResponses } from '../hooks/useFormResponses'

interface Props {
  formId: string | null
  onClose: () => void
}

export default function FormResponsesPanel({ formId, onClose }: Props) {
  const { data: form, isLoading: formLoading } = useFormDetail(formId)
  const { data, isLoading: responsesLoading } = useFormResponses(formId)

  const isLoading = formLoading || responsesLoading
  const responses = data?.responses ?? []

  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 flex flex-col bg-white shadow-2xl border-l border-gray-200 transition-transform duration-300 w-full max-w-md ${
        formId ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <div>
          <h2 className="text-base font-semibold text-gray-900 truncate">
            {form?.title ?? 'Respuestas'}
          </h2>
          {data && (
            <p className="text-xs text-gray-500">
              {data.total} respuesta{data.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
            ))}
          </>
        )}

        {!isLoading && responses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <span className="text-4xl mb-2">📋</span>
            <p className="text-sm">Aún no hay respuestas</p>
          </div>
        )}

        {!isLoading &&
          responses.map((r) => (
            <div key={r.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {r.respondent_name ?? r.respondent_email ?? 'Anónimo'}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(r.submitted_at).toLocaleDateString('es-ES')}
                </span>
              </div>
              {r.respondent_email && r.respondent_name && (
                <p className="text-xs text-gray-500 truncate">{r.respondent_email}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {Object.keys(r.answers).length} respuesta
                {Object.keys(r.answers).length !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
      </div>
    </div>
  )
}
