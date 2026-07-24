import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConvertMenu } from '../components/ConvertMenu'

describe('ConvertMenu', () => {
  it('does not show the delete option when onDelete is absent', () => {
    render(<ConvertMenu onConvert={vi.fn()} />)
    expect(screen.queryByText('Eliminar mensaje')).not.toBeInTheDocument()
  })

  it('shows and fires the delete option when onDelete is provided', () => {
    const onDelete = vi.fn()
    render(<ConvertMenu onConvert={vi.fn()} onDelete={onDelete} />)
    const item = screen.getByText('Eliminar mensaje')
    expect(item).toBeInTheDocument()
    fireEvent.click(item)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
