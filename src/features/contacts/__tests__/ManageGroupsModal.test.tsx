import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ManageGroupsModal } from '../components/ManageGroupsModal'
import { useContactGroups } from '../hooks/useContactGroups'
import { useCreateContactGroup } from '../hooks/useCreateContactGroup'
import { useDeleteContactGroup } from '../hooks/useDeleteContactGroup'
import type { ContactGroup } from '../types'

vi.mock('../hooks/useContactGroups')
vi.mock('../hooks/useCreateContactGroup')
vi.mock('../hooks/useDeleteContactGroup')

const mockGroups: ContactGroup[] = [
  { id: 'g1', name: 'Clientes', color: '#3B82F6', contacts_count: 2 },
  { id: 'g2', name: 'Proveedores', color: '#10B981', contacts_count: 0 },
]

const mockCreateMutate = vi.fn()
const mockDeleteMutate = vi.fn()

describe('ManageGroupsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useContactGroups).mockReturnValue({
      data: mockGroups,
      isLoading: false,
    } as unknown as ReturnType<typeof useContactGroups>)

    vi.mocked(useCreateContactGroup).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateContactGroup>)

    vi.mocked(useDeleteContactGroup).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteContactGroup>)
  })

  it('lista los grupos existentes con su contador de contactos', () => {
    render(<ManageGroupsModal onClose={vi.fn()} />)
    expect(screen.getByText('Clientes')).toBeInTheDocument()
    expect(screen.getByText('2 contactos')).toBeInTheDocument()
    expect(screen.getByText('Proveedores')).toBeInTheDocument()
    expect(screen.getByText('0 contactos')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay grupos', () => {
    vi.mocked(useContactGroups).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useContactGroups>)
    render(<ManageGroupsModal onClose={vi.fn()} />)
    expect(screen.getByText('No hay grupos aún')).toBeInTheDocument()
  })

  it('crear grupo llama al mutate con nombre y color', () => {
    render(<ManageGroupsModal onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Nombre del grupo'), {
      target: { value: 'VIP' },
    })
    fireEvent.click(screen.getByText('Agregar grupo'))
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'VIP' }),
      expect.any(Object),
    )
  })

  it('el botón Agregar grupo está deshabilitado sin nombre', () => {
    render(<ManageGroupsModal onClose={vi.fn()} />)
    expect(screen.getByText('Agregar grupo')).toBeDisabled()
  })

  it('eliminar un grupo requiere confirmación', () => {
    render(<ManageGroupsModal onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Eliminar grupo Clientes'))
    expect(screen.getByText('Sí, eliminar')).toBeInTheDocument()
    expect(mockDeleteMutate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Sí, eliminar')).not.toBeInTheDocument()
    expect(mockDeleteMutate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Eliminar grupo Clientes'))
    fireEvent.click(screen.getByText('Sí, eliminar'))
    expect(mockDeleteMutate).toHaveBeenCalledWith('g1', expect.any(Object))
  })
})
