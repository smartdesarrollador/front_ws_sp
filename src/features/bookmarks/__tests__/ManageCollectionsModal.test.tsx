import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ManageCollectionsModal } from '../components/ManageCollectionsModal'
import { useCollections } from '../hooks/useCollections'
import { useCreateCollection } from '../hooks/useCreateCollection'
import { useDeleteCollection } from '../hooks/useDeleteCollection'
import type { BookmarkCollection } from '../types'

vi.mock('../hooks/useCollections')
vi.mock('../hooks/useCreateCollection')
vi.mock('../hooks/useDeleteCollection')

const mockCollections: BookmarkCollection[] = [
  { id: 'c1', name: 'Lectura', color: '#3B82F6', bookmarks_count: 2 },
  { id: 'c2', name: 'Investigación', color: '#10B981', bookmarks_count: 0 },
]

const mockCreateMutate = vi.fn()
const mockDeleteMutate = vi.fn()

describe('ManageCollectionsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCollections).mockReturnValue({
      data: mockCollections,
      isLoading: false,
    } as unknown as ReturnType<typeof useCollections>)

    vi.mocked(useCreateCollection).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateCollection>)

    vi.mocked(useDeleteCollection).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteCollection>)
  })

  it('lista las colecciones existentes con su contador de bookmarks', () => {
    render(<ManageCollectionsModal onClose={vi.fn()} />)
    expect(screen.getByText('Lectura')).toBeInTheDocument()
    expect(screen.getByText('2 bookmarks')).toBeInTheDocument()
    expect(screen.getByText('Investigación')).toBeInTheDocument()
    expect(screen.getByText('0 bookmarks')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay colecciones', () => {
    vi.mocked(useCollections).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useCollections>)
    render(<ManageCollectionsModal onClose={vi.fn()} />)
    expect(screen.getByText('No hay colecciones aún')).toBeInTheDocument()
  })

  it('crear colección llama al mutate con nombre y color', () => {
    render(<ManageCollectionsModal onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Nombre de la colección'), {
      target: { value: 'Favoritos' },
    })
    fireEvent.click(screen.getByText('Agregar colección'))
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Favoritos' }),
      expect.any(Object),
    )
  })

  it('el botón Agregar colección está deshabilitado sin nombre', () => {
    render(<ManageCollectionsModal onClose={vi.fn()} />)
    expect(screen.getByText('Agregar colección')).toBeDisabled()
  })

  it('eliminar una colección requiere confirmación', () => {
    render(<ManageCollectionsModal onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Eliminar colección Lectura'))
    expect(screen.getByText('Sí, eliminar')).toBeInTheDocument()
    expect(mockDeleteMutate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Sí, eliminar')).not.toBeInTheDocument()
    expect(mockDeleteMutate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Eliminar colección Lectura'))
    fireEvent.click(screen.getByText('Sí, eliminar'))
    expect(mockDeleteMutate).toHaveBeenCalledWith('c1', expect.any(Object))
  })
})
