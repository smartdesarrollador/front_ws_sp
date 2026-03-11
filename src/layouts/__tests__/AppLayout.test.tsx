import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppLayout from '../AppLayout'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/features/auth/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatureGate } from '@/hooks/useFeatureGate'

vi.mock('@/store/authStore')
vi.mock('@/store/uiStore')
vi.mock('@/features/auth/AuthContext')
vi.mock('@/hooks/usePermissions')
vi.mock('@/hooks/useFeatureGate')
vi.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => ({ notifications: [], unreadCount: 0, isLoading: false }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

const mockToggleSidebar = vi.fn()
const mockToggleDarkMode = vi.fn()
const mockLogout = vi.fn()

const mockUiState = {
  sidebarOpen: true,
  darkMode: false,
  toggleSidebar: mockToggleSidebar,
  toggleDarkMode: mockToggleDarkMode,
  language: 'es' as const,
  setLanguage: vi.fn(),
}

const mockAuthState = {
  user: {
    id: '1',
    email: 'admin@acme.com',
    first_name: 'Admin',
    last_name: 'User',
    is_active: true,
    email_verified: true,
    roles: ['Owner'],
    permissions: ['audit.view_auditlog'],
    mfa_enabled: false,
  },
  tenant: {
    id: 't1',
    name: 'Acme Corp',
    slug: 'acme',
    subdomain: 'acme',
    plan: 'professional',
  },
  accessToken: 'token',
  isAuthenticated: true,
  setUser: vi.fn(),
  setTenant: vi.fn(),
  setAccessToken: vi.fn(),
  clearAuth: vi.fn(),
}

function makeRouter(initialEntry = '/') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [{ index: true, element: <div>Dashboard content</div> }],
      },
    ],
    { initialEntries: [initialEntry] },
  )
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useUiStore).mockImplementation((selector?: any) =>
      typeof selector === 'function'
        ? selector(mockUiState)
        : (mockUiState as ReturnType<typeof useUiStore>),
    )

    vi.mocked(useAuthStore).mockImplementation(
      (selector?: (s: typeof mockAuthState) => unknown) => {
        if (typeof selector === 'function') return selector(mockAuthState)
        return mockAuthState
      },
    )

    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
    })

    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: () => true,
      hasRole: () => false,
      isOwner: false,
      isAdmin: true,
      getPrimaryRole: () => 'Owner',
      getRoleColor: () => '#dc2626',
      tenant: mockAuthState.tenant,
    })

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })
  })

  it('renders Navbar and Sidebar', () => {
    makeRouter()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('shows mobile overlay when sidebarOpen=true and calls toggleSidebar on click', () => {
    makeRouter()
    const overlay = screen.getByTestId('mobile-overlay')
    expect(overlay).toBeInTheDocument()
    fireEvent.click(overlay)
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('hides mobile overlay when sidebarOpen=false', () => {
    vi.mocked(useUiStore).mockImplementation((selector?: any) => {
      const state = { ...mockUiState, sidebarOpen: false }
      return typeof selector === 'function' ? selector(state) : state
    })
    makeRouter()
    expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument()
  })

  it('renders Outlet (child content)', () => {
    makeRouter()
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })
})
