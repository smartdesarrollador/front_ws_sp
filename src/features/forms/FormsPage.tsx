import { useState } from 'react'
import { ClipboardList, Plus, Search } from 'lucide-react'
import { useForms } from './hooks/useForms'
import { useDeleteForm } from './hooks/useDeleteForm'
import FormCard from './components/FormCard'
import FormModal from './components/FormModal'
import FormResponsesPanel from './components/FormResponsesPanel'
import type { Form, FormStatus } from './types'
import FeatureGate from '@/components/shared/FeatureGate'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import { useFeatureGate } from '@/hooks/useFeatureGate'

type StatusFilter = FormStatus | 'all'

const STATUS_PILLS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'draft', label: 'Borradores' },
  { value: 'closed', label: 'Cerrados' },
]

export default function FormsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showModal, setShowModal] = useState(false)
  const [formToEdit, setFormToEdit] = useState<Form | null>(null)
  const [responsesFormId, setResponsesFormId] = useState<string | null>(null)

  const { data, isLoading } = useForms({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
  })
  const deleteForm = useDeleteForm()
  const { getLimit } = useFeatureGate()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formsLimit: number | null = (getLimit as unknown as (key: string) => number | null)(
    'forms',
  )

  const forms = data?.forms ?? []
  const total = data?.total ?? 0

  const handleEdit = (form: Form) => {
    setFormToEdit(form)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteForm.mutate(id)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormToEdit(null)
  }

  return (
    <FeatureGate feature="forms" fallback={<UpgradePrompt feature="forms" />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Formularios</h1>
            <span className="bg-gray-100 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {total}
            </span>
          </div>
          <button
            onClick={() => {
              setFormToEdit(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Formulario
          </button>
        </div>

        {/* Plan limit banner */}
        {formsLimit !== null && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            Usando {total} de {formsLimit} formularios de tu plan.
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar formularios..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-1.5">
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setStatusFilter(pill.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === pill.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {isLoading && (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-8 w-20 bg-gray-100 rounded" />
                </div>
              ))}
            </>
          )}

          {!isLoading && forms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Sin formularios</p>
              <p className="text-xs mt-1">Crea tu primer formulario con el botón de arriba</p>
            </div>
          )}

          {!isLoading &&
            forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewResponses={setResponsesFormId}
              />
            ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && <FormModal form={formToEdit} onClose={handleCloseModal} />}

      {/* Responses panel */}
      <FormResponsesPanel
        formId={responsesFormId}
        onClose={() => setResponsesFormId(null)}
      />
    </FeatureGate>
  )
}
