import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookmarkViewModal } from '../components/BookmarkViewModal'
import type { Bookmark } from '../types'

const writeText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  writeText.mockClear()
  Object.assign(navigator, { clipboard: { writeText } })
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
})

const bookmark: Bookmark = {
  id: 'b1',
  title: 'React Docs',
  url: 'https://react.dev',
  description: 'Documentación oficial',
  collection: { id: 'col1', name: 'Frontend', color: '#3b82f6', bookmarks_count: 5 },
  tags: ['react', 'docs'],
  favicon: null,
  is_favorite: true,
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-01T10:00:00Z',
}

function renderModal(props: { bookmark?: Bookmark | null; open: boolean; onClose: () => void }) {
  return render(
    <BookmarkViewModal
      bookmark={props.bookmark ?? null}
      open={props.open}
      onClose={props.onClose}
    />,
  )
}

describe('BookmarkViewModal', () => {
  it('no renderiza nada si open es false', () => {
    renderModal({ bookmark, open: false, onClose: vi.fn() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no renderiza nada si no hay bookmark', () => {
    renderModal({ bookmark: null, open: true, onClose: vi.fn() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza título, URL, colección y tags', () => {
    renderModal({ bookmark, open: true, onClose: vi.fn() })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('React Docs')).toBeInTheDocument()
    expect(screen.getByText('https://react.dev')).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('#docs')).toBeInTheDocument()
  })

  it('copia el título de forma independiente de la URL', async () => {
    renderModal({ bookmark, open: true, onClose: vi.fn() })

    fireEvent.click(screen.getByLabelText('Copiar título'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('React Docs')
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Copiar título').querySelector('.text-green-500')).toBeTruthy()
    })
    expect(screen.getByLabelText('Copiar URL').querySelector('.text-green-500')).toBeFalsy()
  })

  it('copia la URL de forma independiente del título', async () => {
    renderModal({ bookmark, open: true, onClose: vi.fn() })

    fireEvent.click(screen.getByLabelText('Copiar URL'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('https://react.dev')
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Copiar URL').querySelector('.text-green-500')).toBeTruthy()
    })
    expect(screen.getByLabelText('Copiar título').querySelector('.text-green-500')).toBeFalsy()
  })

  it('llama a onClose al hacer click en Cerrar', () => {
    const onClose = vi.fn()
    renderModal({ bookmark, open: true, onClose })

    fireEvent.click(screen.getByText('Cerrar'))

    expect(onClose).toHaveBeenCalled()
  })
})
