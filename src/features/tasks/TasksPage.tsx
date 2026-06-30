import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, List, Columns } from 'lucide-react'
import { useTasks } from './hooks/useTasks'
import { useDeleteTask } from './hooks/useDeleteTask'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useImportTasks } from './hooks/useImportTasks'
import ExportMenu, { type ExportFormat } from '@/components/shared/ExportMenu'
import ImportButton from '@/components/shared/ImportButton'
import ImportModal from '@/components/shared/ImportModal'
import { toCSV, toJSON, downloadBlob } from '@/lib/export'
import { parseTasksFile } from '@/lib/import'
import { TaskFilters } from './components/TaskFilters'
import { TaskListView } from './components/TaskListView'
import { TaskKanbanView } from './components/TaskKanbanView'
import { TaskModal } from './components/TaskModal'
import type { Task, TaskFiltersState } from './types'

const EMPTY_FILTERS: TaskFiltersState = { search: '', status: '', priority: '' }

export default function TasksPage() {
  const [searchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === 'true')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<TaskFiltersState>(EMPTY_FILTERS)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  const { data, isLoading } = useTasks(filters)
  const deleteTask = useDeleteTask()
  const importTasks = useImportTasks()
  const { hasFeature } = useFeatureGate()
  const { data: summaryData } = useDashboardSummary()

  const tasks = data?.tasks ?? []
  const total = data?.total ?? 0

  const tasksActive = summaryData?.usage.tasks_active ?? 0
  const tasksLimit = summaryData?.usage.tasks_limit ?? null
  const showPlanBanner = tasksLimit !== null && tasksActive >= tasksLimit * 0.8

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteTask.mutate(id)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const kanbanDisabled = !hasFeature('kanban_view')

  const exportFormats: ExportFormat[] = [
    {
      id: 'csv',
      label: 'CSV',
      run: () =>
        downloadBlob(
          new Blob(
            [
              toCSV(tasks, [
                { label: 'Título', value: (t) => t.title },
                { label: 'Descripción', value: (t) => t.description ?? '' },
                { label: 'Estado', value: (t) => t.status },
                { label: 'Prioridad', value: (t) => t.priority },
                { label: 'Vencimiento', value: (t) => t.due_date ?? '' },
                { label: 'Creada', value: (t) => t.created_at },
              ]),
            ],
            { type: 'text/csv;charset=utf-8' },
          ),
          'tareas.csv',
        ),
    },
    {
      id: 'json',
      label: 'JSON',
      run: () => downloadBlob(new Blob([toJSON(tasks)], { type: 'application/json' }), 'tareas.json'),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tareas</h1>
        <div className="flex items-center gap-2">
          <ImportButton
            feature="tasks_import"
            disabledHint="Actualiza tu plan para importar tareas"
            renderModal={(close) => (
              <ImportModal
                title="Importar tareas"
                accept=".csv,.json"
                formatsHint="CSV o JSON"
                parseFile={parseTasksFile}
                columns={[
                  { label: 'Título', value: (t) => t.title ?? '' },
                  { label: 'Estado', value: (t) => t.status ?? '' },
                  { label: 'Prioridad', value: (t) => t.priority ?? '' },
                ]}
                onImport={(items) => importTasks.mutateAsync(items)}
                onClose={close}
              />
            )}
          />
          <ExportMenu
            feature="tasks_export"
            formats={exportFormats}
            disabledHint="Actualiza tu plan para exportar tareas"
          />
          <button
            onClick={() => {
              setEditingTask(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* Plan limit banner */}
      {showPlanBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Has alcanzado el {Math.round((tasksActive / (tasksLimit ?? 1)) * 100)}% del límite de
          tareas de tu plan ({tasksActive}/{tasksLimit}). Considera actualizar tu plan.
        </div>
      )}

      {/* View toggle + filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TaskFilters filters={filters} onChange={setFilters} totalCount={total} />
          <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              aria-label="Vista lista"
              aria-pressed={viewMode === 'list'}
              className={`p-1.5 rounded ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => !kanbanDisabled && setViewMode('kanban')}
              aria-label="Vista kanban"
              aria-pressed={viewMode === 'kanban'}
              disabled={kanbanDisabled}
              title={
                kanbanDisabled ? 'Vista kanban disponible en planes superiores' : undefined
              }
              className={`p-1.5 rounded ${
                viewMode === 'kanban'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : kanbanDisabled
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <TaskListView tasks={tasks} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <TaskKanbanView tasks={tasks} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <TaskModal task={editingTask} open={modalOpen} onClose={handleCloseModal} />
    </div>
  )
}
