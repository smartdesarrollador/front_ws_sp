import { useState } from 'react'
import { ArrowLeft, Plus, Users, Pencil } from 'lucide-react'
import { useProjectDetail } from '../hooks/useProjectDetail'
import { useProjectFields, useCreateField, useDeleteField } from '../hooks/useProjectFields'
import { useCreateSection, useUpdateSection, useDeleteSection } from '../hooks/useProjectSections'
import type { ProjectItem, ProjectSection } from '../types'
import { SectionAccordion } from './SectionAccordion'
import { FieldCard } from './FieldCard'
import { ItemModal } from './ItemModal'
import { ShareProjectModal } from './ShareProjectModal'

interface Props {
  projectId: string
  onBack: () => void
}

interface FieldFormState {
  fieldName: string
  fieldValue: string
  fieldType: 'password' | 'url' | 'email' | 'date' | 'text'
  isEncrypted: boolean
}

export default function ProjectDetail({ projectId, onBack }: Props) {
  const { project, sections, isLoading } = useProjectDetail(projectId)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [itemModalSectionId, setItemModalSectionId] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showFieldForm, setShowFieldForm] = useState(false)
  const [fieldForm, setFieldForm] = useState<FieldFormState>({
    fieldName: '',
    fieldValue: '',
    fieldType: 'text',
    isEncrypted: false,
  })

  const { data: fields } = useProjectFields({
    projectId,
    itemId: selectedItem?.id ?? '',
  })

  const createSection = useCreateSection()
  const updateSection = useUpdateSection()
  const deleteSection = useDeleteSection()
  const createField = useCreateField()
  const deleteField = useDeleteField()

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const handleSelectItem = (item: ProjectItem) => {
    setSelectedItem(item)
  }

  const handleAddItem = (sectionId: string) => {
    setItemModalSectionId(sectionId)
    setShowItemModal(true)
  }

  const handleAddSection = () => {
    const name = window.prompt('Nombre de la nueva sección:')
    if (name && name.trim()) {
      createSection.mutate({ projectId, name: name.trim() })
    }
  }

  const handleEditSection = (section: ProjectSection) => {
    const name = window.prompt('Nombre de la sección:', section.name)
    if (name && name.trim()) {
      updateSection.mutate({ projectId, sectionId: section.id, name: name.trim() })
    }
  }

  const handleDeleteSection = (section: ProjectSection) => {
    deleteSection.mutate({ projectId, sectionId: section.id })
  }

  const handleAddField = () => {
    if (!selectedItem) return
    createField.mutate(
      {
        projectId,
        itemId: selectedItem.id,
        field_name: fieldForm.fieldName,
        field_value: fieldForm.fieldValue,
        field_type: fieldForm.fieldType,
        is_encrypted: fieldForm.isEncrypted,
      },
      {
        onSuccess: () => {
          setShowFieldForm(false)
          setFieldForm({ fieldName: '', fieldValue: '', fieldType: 'text', isEncrypted: false })
        },
      },
    )
  }

  const handleDeleteField = (fieldId: string) => {
    if (!selectedItem) return
    deleteField.mutate({ projectId, itemId: selectedItem.id, fieldId })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <span className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        Proyecto no encontrado.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Volver a proyectos"
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Sections tree */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
          {sections.map((section) => (
            <SectionAccordion
              key={section.id}
              section={section}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => handleToggleSection(section.id)}
              selectedItemId={selectedItem?.id}
              onSelectItem={handleSelectItem}
              onAddItem={() => handleAddItem(section.id)}
              onEditSection={() => handleEditSection(section)}
              onDeleteSection={() => handleDeleteSection(section)}
            />
          ))}
          <button
            onClick={handleAddSection}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva sección
          </button>
        </aside>

        {/* Right: Fields */}
        <div className="flex-1 min-w-0">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowFieldForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir campo
                </button>
              </div>

              {/* Field form */}
              {showFieldForm && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={fieldForm.fieldName}
                      onChange={(e) => setFieldForm((f) => ({ ...f, fieldName: e.target.value }))}
                      placeholder="Nombre del campo"
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select
                      value={fieldForm.fieldType}
                      onChange={(e) =>
                        setFieldForm((f) => ({
                          ...f,
                          fieldType: e.target.value as typeof fieldForm.fieldType,
                        }))
                      }
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="text">Texto</option>
                      <option value="password">Contraseña</option>
                      <option value="url">URL</option>
                      <option value="email">Email</option>
                      <option value="date">Fecha</option>
                    </select>
                  </div>
                  <input
                    value={fieldForm.fieldValue}
                    onChange={(e) => setFieldForm((f) => ({ ...f, fieldValue: e.target.value }))}
                    placeholder="Valor"
                    type={fieldForm.fieldType === 'password' ? 'password' : 'text'}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={fieldForm.isEncrypted}
                        onChange={(e) =>
                          setFieldForm((f) => ({ ...f, isEncrypted: e.target.checked }))
                        }
                        className="w-4 h-4"
                      />
                      Cifrar valor
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFieldForm(false)}
                        className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddField}
                        disabled={createField.isPending}
                        className="px-3 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fields grid */}
              {(fields ?? []).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(fields ?? []).map((field) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      projectId={projectId}
                      itemId={selectedItem.id}
                      onEdit={() => {
                        /* TODO: open edit field modal */
                      }}
                      onDelete={() => handleDeleteField(field.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Pencil className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No hay campos. Añade el primero.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <p className="text-sm">Selecciona un ítem para ver sus campos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showItemModal && (
        <ItemModal
          sectionId={itemModalSectionId}
          projectId={projectId}
          onClose={() => setShowItemModal(false)}
        />
      )}
      {showShareModal && (
        <ShareProjectModal projectId={projectId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}
