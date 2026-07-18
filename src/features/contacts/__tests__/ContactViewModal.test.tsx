import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContactViewModal } from '../components/ContactViewModal'
import type { Contact } from '../types'

const writeText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  writeText.mockClear()
  Object.assign(navigator, { clipboard: { writeText } })
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
})

const contact: Contact = {
  id: 'c1',
  name: 'Ana Torres',
  email: 'ana@example.com',
  phone: '+34 600 123 456',
  company: 'Acme Corp',
  job_title: 'CTO',
  group: { id: 'g1', name: 'Clientes', color: '#3b82f6', contacts_count: 3 },
  notes: 'Contactar por la mañana',
  is_shared: false,
  shared_by_name: null,
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-01T10:00:00Z',
}

function renderModal(props: { contact?: Contact | null; open: boolean; onClose: () => void }) {
  return render(
    <ContactViewModal contact={props.contact ?? null} open={props.open} onClose={props.onClose} />,
  )
}

describe('ContactViewModal', () => {
  it('no renderiza nada si open es false', () => {
    renderModal({ contact, open: false, onClose: vi.fn() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no renderiza nada si no hay contacto', () => {
    renderModal({ contact: null, open: true, onClose: vi.fn() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza nombre, email, teléfono, empresa y grupo', () => {
    renderModal({ contact, open: true, onClose: vi.fn() })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Ana Torres')).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('+34 600 123 456')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp · CTO')).toBeInTheDocument()
    expect(screen.getByText('Clientes')).toBeInTheDocument()
  })

  it('copia el nombre de forma independiente del email', async () => {
    renderModal({ contact, open: true, onClose: vi.fn() })

    fireEvent.click(screen.getByLabelText('Copiar nombre'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Ana Torres')
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Copiar nombre').querySelector('.text-green-500')).toBeTruthy()
    })
    expect(screen.getByLabelText('Copiar email').querySelector('.text-green-500')).toBeFalsy()
  })

  it('copia el email de forma independiente del nombre', async () => {
    renderModal({ contact, open: true, onClose: vi.fn() })

    fireEvent.click(screen.getByLabelText('Copiar email'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('ana@example.com')
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Copiar email').querySelector('.text-green-500')).toBeTruthy()
    })
    expect(screen.getByLabelText('Copiar nombre').querySelector('.text-green-500')).toBeFalsy()
  })

  it('llama a onClose al hacer click en Cerrar', () => {
    const onClose = vi.fn()
    renderModal({ contact, open: true, onClose })

    fireEvent.click(screen.getByText('Cerrar'))

    expect(onClose).toHaveBeenCalled()
  })
})
