import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ManageCategoriesModal } from '../components/ManageCategoriesModal'
import { useCategories } from '../hooks/useCategories'
import { useCreateCategory } from '../hooks/useCreateCategory'
import { useDeleteCategory } from '../hooks/useDeleteCategory'
import type { NoteCategory } from '../types'

vi.mock('../hooks/useCategories')
vi.mock('../hooks/useCreateCategory')
vi.mock('../hooks/useDeleteCategory')

const mockCategories: NoteCategory[] = [
  { id: 'c1', name: 'Trabajo', color: '#3B82F6', notes_count: 2 },
  { id: 'c2', name: 'Ideas', color: '#F59E0B', notes_count: 0 },
]

const mockCreateMutate = vi.fn()
const mockDeleteMutate = vi.fn()

describe('ManageCategoriesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    } as unknown as ReturnType<typeof useCategories>)

    vi.mocked(useCreateCategory).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateCategory>)

    vi.mocked(useDeleteCategory).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteCategory>)
  })

  it('lista las categorías existentes con su contador de notas', () => {
    render(<ManageCategoriesModal onClose={vi.fn()} />)
    expect(screen.getByText('Trabajo')).toBeInTheDocument()
    expect(screen.getByText('2 notas')).toBeInTheDocument()
    expect(screen.getByText('Ideas')).toBeInTheDocument()
    expect(screen.getByText('0 notas')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay categorías', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategories>)
    render(<ManageCategoriesModal onClose={vi.fn()} />)
    expect(screen.getByText('No hay categorías aún')).toBeInTheDocument()
  })

  it('crear categoría llama al mutate con nombre y color', () => {
    render(<ManageCategoriesModal onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Nombre de la categoría'), {
      target: { value: 'Archivo' },
    })
    fireEvent.click(screen.getByText('Agregar categoría'))
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Archivo' }),
      expect.any(Object),
    )
  })

  it('el botón Agregar categoría está deshabilitado sin nombre', () => {
    render(<ManageCategoriesModal onClose={vi.fn()} />)
    expect(screen.getByText('Agregar categoría')).toBeDisabled()
  })

  it('eliminar una categoría requiere confirmación', () => {
    render(<ManageCategoriesModal onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Eliminar categoría Trabajo'))
    expect(screen.getByText('Sí, eliminar')).toBeInTheDocument()
    expect(mockDeleteMutate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Sí, eliminar')).not.toBeInTheDocument()
    expect(mockDeleteMutate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Eliminar categoría Trabajo'))
    fireEvent.click(screen.getByText('Sí, eliminar'))
    expect(mockDeleteMutate).toHaveBeenCalledWith('c1', expect.any(Object))
  })
})
