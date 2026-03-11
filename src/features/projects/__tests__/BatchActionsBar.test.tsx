import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BatchActionsBar } from '../components/BatchActionsBar'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDeleteItem } from '../hooks/useProjectItems'

vi.mock('@/hooks/useFeatureGate')
vi.mock('../hooks/useProjectItems')

const mockDeleteMutate = vi.fn()
const mockOnClear = vi.fn()

function renderBatchActionsBar({
  selectedIds = ['item-1', 'item-2'],
  projectId = 'proj-1',
  onClear = mockOnClear,
} = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <BatchActionsBar selectedIds={selectedIds} projectId={projectId} onClear={onClear} />
    </QueryClientProvider>,
  )
}

describe('BatchActionsBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useDeleteItem).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteItem>)
  })

  it('no renderiza cuando no tiene feature batch_actions', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => false,
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })

    const { container } = renderBatchActionsBar()
    expect(container.firstChild).toBeNull()
    expect(screen.queryByTestId('batch-actions-bar')).not.toBeInTheDocument()
  })

  it('renderiza con conteo cuando hasFeature=true y selectedIds tiene ítems', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })

    renderBatchActionsBar({ selectedIds: ['item-1', 'item-2'] })
    expect(screen.getByTestId('batch-actions-bar')).toBeInTheDocument()
    expect(screen.getByText('2 seleccionados')).toBeInTheDocument()
  })

  it('click en "Cancelar" llama a onClear', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })

    renderBatchActionsBar()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(mockOnClear).toHaveBeenCalledTimes(1)
  })
})
