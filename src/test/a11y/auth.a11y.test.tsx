import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import LoginPage from '@/features/auth/LoginPage'
import { useLogin } from '@/features/auth/hooks/useLogin'

vi.mock('@/features/auth/hooks/useLogin')

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ isAuthenticated: false, user: null }),
}))

vi.mock('@/lib/axios', () => ({
  publicClient: { post: vi.fn() },
  apiClient: { post: vi.fn() },
}))

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
      data: undefined,
    } as unknown as ReturnType<typeof useLogin>)
  })

  it('renders without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
