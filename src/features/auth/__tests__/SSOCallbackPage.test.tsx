import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SSOCallbackPage from '@/features/auth/SSOCallbackPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }))

vi.mock('@/lib/axios', () => ({
  publicClient: { post: mockPost },
  apiClient: { post: vi.fn() },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      setUser: vi.fn(),
      setTenant: vi.fn(),
      setAccessToken: vi.fn(),
    }),
  },
}))

function renderWithToken(token: string | null) {
  const search = token ? `?sso_token=${token}` : ''
  return render(
    <MemoryRouter initialEntries={[`/sso/callback${search}`]}>
      <Routes>
        <Route path="/sso/callback" element={<SSOCallbackPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SSOCallbackPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockPost.mockClear()
    localStorage.clear()
  })

  it('valida sso_token y navega al dashboard', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: { id: '1', email: 'user@test.com' },
        tenant: { id: 't1', name: 'Test' },
      },
    })

    renderWithToken('valid-sso-token')

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/sso/validate', {
        sso_token: 'valid-sso-token',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('redirige a /login cuando no hay sso_token', async () => {
    renderWithToken(null)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})
