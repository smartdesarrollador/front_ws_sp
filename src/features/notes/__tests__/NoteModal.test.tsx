import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NoteModal } from '../components/NoteModal'
import { useCreateNote } from '../hooks/useCreateNote'
import { useUpdateNote } from '../hooks/useUpdateNote'
import { useNoteTagSuggestions } from '../hooks/useNoteTagSuggestions'
import { useCategories } from '../hooks/useCategories'
import type { Note } from '../types'

vi.mock('../hooks/useCreateNote')
vi.mock('../hooks/useUpdateNote')
vi.mock('../hooks/useNoteTagSuggestions')
vi.mock('../hooks/useCategories')

const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

const existingNote: Note = {
  id: 'n1',
  title: 'Meeting notes',
  content: 'Content about the meeting',
  category: { id: 'c1', name: 'Trabajo', color: '#3b82f6', notes_count: 1 },
  tags: ['trabajo', 'reunion'],
  is_pinned: false,
  is_shared: false,
  shared_by_name: null,
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-01T10:00:00Z',
}

function renderModal(props: { note?: Note | null; open: boolean; onClose: () => void }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <NoteModal {...props} />
    </QueryClientProvider>,
  )
}

describe('NoteModal — Etiquetas', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCreateNote).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateNote>)

    vi.mocked(useUpdateNote).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateNote>)

    vi.mocked(useNoteTagSuggestions).mockReturnValue({
      data: ['urgente', 'trabajo'],
    } as unknown as ReturnType<typeof useNoteTagSuggestions>)

    vi.mocked(useCategories).mockReturnValue({
      data: [{ id: 'c1', name: 'Trabajo', color: '#3b82f6', notes_count: 1 }],
    } as unknown as ReturnType<typeof useCategories>)
  })

  it('agrega una etiqueta normalizada al presionar Enter', () => {
    renderModal({ note: null, open: true, onClose: vi.fn() })
    const input = screen.getByPlaceholderText('Escribir etiqueta...')
    fireEvent.change(input, { target: { value: 'Urgente' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('#urgente')).toBeInTheDocument()
  })

  it('agrega una etiqueta al presionar coma', () => {
    renderModal({ note: null, open: true, onClose: vi.fn() })
    const input = screen.getByPlaceholderText('Escribir etiqueta...')
    fireEvent.change(input, { target: { value: 'cliente' } })
    fireEvent.keyDown(input, { key: ',' })
    expect(screen.getByText('#cliente')).toBeInTheDocument()
  })

  it('no duplica una etiqueta ya agregada', () => {
    renderModal({ note: null, open: true, onClose: vi.fn() })
    const input = screen.getByPlaceholderText('Escribir etiqueta...')
    fireEvent.change(input, { target: { value: 'urgente' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.change(input, { target: { value: 'urgente' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getAllByText('#urgente')).toHaveLength(1)
  })

  it('Backspace con el input vacío elimina la última etiqueta', () => {
    renderModal({ note: null, open: true, onClose: vi.fn() })
    const input = screen.getByPlaceholderText('Escribir etiqueta...')
    fireEvent.change(input, { target: { value: 'uno' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.change(input, { target: { value: 'dos' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(screen.queryByText('#dos')).not.toBeInTheDocument()
    expect(screen.getByText('#uno')).toBeInTheDocument()
  })

  it('clic en una sugerencia la agrega como etiqueta', () => {
    renderModal({ note: null, open: true, onClose: vi.fn() })
    const input = screen.getByPlaceholderText('Escribir etiqueta...')
    fireEvent.focus(input)
    fireEvent.click(screen.getByRole('button', { name: '#urgente' }))
    expect(screen.getByText('#urgente')).toBeInTheDocument()
  })

  it('clic en la "x" de una etiqueta la elimina', () => {
    renderModal({ note: null, open: true, onClose: vi.fn() })
    const input = screen.getByPlaceholderText('Escribir etiqueta...')
    fireEvent.change(input, { target: { value: 'temp' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.click(screen.getByLabelText('Quitar etiqueta temp'))
    expect(screen.queryByText('#temp')).not.toBeInTheDocument()
  })

  it('al editar una nota existente precarga las etiquetas como chips', () => {
    renderModal({ note: existingNote, open: true, onClose: vi.fn() })
    expect(screen.getByText('#trabajo')).toBeInTheDocument()
    expect(screen.getByText('#reunion')).toBeInTheDocument()
  })

  it('el submit envía las etiquetas como array', async () => {
    renderModal({ note: null, open: true, onClose: vi.fn() })
    fireEvent.change(screen.getByPlaceholderText('Título de la nota'), {
      target: { value: 'Nota con tags' },
    })
    fireEvent.change(screen.getByPlaceholderText('Escribe el contenido de tu nota...'), {
      target: { value: 'Contenido' },
    })
    const tagInput = screen.getByPlaceholderText('Escribir etiqueta...')
    fireEvent.change(tagInput, { target: { value: 'nueva' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })
    fireEvent.click(screen.getByText('Crear nota'))
    await waitFor(() => expect(mockCreateMutate).toHaveBeenCalled())
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['nueva'] }),
      expect.any(Object),
    )
  })
})
