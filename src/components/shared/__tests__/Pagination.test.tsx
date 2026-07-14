import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '../Pagination'

describe('Pagination', () => {
  it('renders nothing when total is 0', () => {
    const { container } = render(
      <Pagination page={1} perPage={20} total={0} onPageChange={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows "Página X de Y" computing totalPages from a non-exact division', () => {
    render(<Pagination page={1} perPage={20} total={45} onPageChange={vi.fn()} />)
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
  })

  it('disables "Anterior" on the first page', () => {
    render(<Pagination page={1} perPage={20} total={45} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
    expect(screen.getByLabelText('Página siguiente')).not.toBeDisabled()
  })

  it('disables "Siguiente" on the last page', () => {
    render(<Pagination page={3} perPage={20} total={45} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled()
    expect(screen.getByLabelText('Página anterior')).not.toBeDisabled()
  })

  it('calls onPageChange with page+1 when clicking "Siguiente"', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} perPage={20} total={45} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByLabelText('Página siguiente'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with page-1 when clicking "Anterior"', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} perPage={20} total={45} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByLabelText('Página anterior'))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})
