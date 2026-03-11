import { FolderOpen } from 'lucide-react'
import type { Project } from '../types'
import { ProjectCard } from './ProjectCard'

interface Props {
  projects: Project[]
  viewMode: 'list' | 'grid'
  onSelect: (id: string) => void
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

export function ProjectList({ projects, viewMode, onSelect, onEdit, onDelete, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-2'}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
          No hay proyectos
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Crea tu primer proyecto para comenzar
        </p>
      </div>
    )
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-2'
      }
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={() => onSelect(project.id)}
          onEdit={() => onEdit(project)}
          onDelete={() => onDelete(project.id)}
        />
      ))}
    </div>
  )
}
