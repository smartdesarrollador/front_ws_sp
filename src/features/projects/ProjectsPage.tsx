import { useState } from 'react'
import { Plus, Download } from 'lucide-react'
import { useProjects } from './hooks/useProjects'
import { useDeleteProject } from './hooks/useDeleteProject'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import FeatureGate from '@/components/shared/FeatureGate'
import { ProjectList } from './components/ProjectList'
import { ProjectModal } from './components/ProjectModal'
import ProjectDetail from './components/ProjectDetail'
import { ViewModeToggle } from './components/ViewModeToggle'
import type { Project } from './types'

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const { data, isLoading } = useProjects()
  const deleteProject = useDeleteProject()
  const { data: summaryData } = useDashboardSummary()

  const allProjects = data?.projects ?? []
  const total = data?.total ?? 0

  // Plan limit banner
  const projectsCount = summaryData?.usage.projects ?? 0
  const projectsLimit = summaryData?.usage.projects_limit ?? null
  const showPlanBanner = projectsLimit !== null && projectsCount >= projectsLimit * 0.8

  const handleEdit = (project: Project) => {
    setProjectToEdit(project)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteProject.mutate(id)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setProjectToEdit(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Proyectos</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />

          {/* Export with FeatureGate */}
          <FeatureGate
            feature="projects_export"
            fallback={
              <button
                disabled
                title="Actualiza tu plan para exportar proyectos"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            }
          >
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </FeatureGate>

          <button
            onClick={() => {
              setProjectToEdit(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Plan limit banner */}
      {showPlanBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Has alcanzado el {Math.round((projectsCount / (projectsLimit ?? 1)) * 100)}% del límite de
          proyectos de tu plan ({projectsCount}/{projectsLimit}). Considera actualizar tu plan.
        </div>
      )}

      {/* Project list + detail panel */}
      {selectedProjectId ? (
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
        />
      ) : (
        <ProjectList
          projects={allProjects}
          viewMode={viewMode}
          onSelect={(id) => setSelectedProjectId(id)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}

      {/* Modal */}
      {showModal && <ProjectModal project={projectToEdit} onClose={handleCloseModal} />}
    </div>
  )
}
