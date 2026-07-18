import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NoteViewModal } from '../components/NoteViewModal'
import type { Note } from '../types'

const writeText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  writeText.mockClear()
  Object.assign(navigator, { clipboard: { writeText } })
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
})

const note: Note = {
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
  return render(<NoteViewModal note={props.note ?? null} open={props.open} onClose={props.onClose} />)
}

describe('NoteViewModal', () => {
  it('no renderiza nada si open es false', () => {
    renderModal({ note, open: false, onClose: vi.fn() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no renderiza nada si no hay nota', () => {
    renderModal({ note: null, open: true, onClose: vi.fn() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza título, contenido, categoría y tags', () => {
    renderModal({ note, open: true, onClose: vi.fn() })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Meeting notes')).toBeInTheDocument()
    expect(screen.getByText('Content about the meeting')).toBeInTheDocument()
    expect(screen.getByText('Trabajo')).toBeInTheDocument()
    expect(screen.getByText('#trabajo')).toBeInTheDocument()
    expect(screen.getByText('#reunion')).toBeInTheDocument()
  })

  it('copia el título de forma independiente del contenido', async () => {
    renderModal({ note, open: true, onClose: vi.fn() })

    fireEvent.click(screen.getByLabelText('Copiar título'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Meeting notes')
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Copiar título').querySelector('.text-green-500')).toBeTruthy()
    })
    expect(screen.getByLabelText('Copiar contenido').querySelector('.text-green-500')).toBeFalsy()
  })

  it('copia el contenido de forma independiente del título', async () => {
    renderModal({ note, open: true, onClose: vi.fn() })

    fireEvent.click(screen.getByLabelText('Copiar contenido'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Content about the meeting')
    })
    await waitFor(() => {
      expect(
        screen.getByLabelText('Copiar contenido').querySelector('.text-green-500'),
      ).toBeTruthy()
    })
    expect(screen.getByLabelText('Copiar título').querySelector('.text-green-500')).toBeFalsy()
  })

  it('llama a onClose al hacer click en Cerrar', () => {
    const onClose = vi.fn()
    renderModal({ note, open: true, onClose })

    fireEvent.click(screen.getByText('Cerrar'))

    expect(onClose).toHaveBeenCalled()
  })
})
