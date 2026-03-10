import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Sidebar from '../components/Sidebar'
import { useUiStore } from '@/store/uiStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatureGate } from '@/hooks/useFeatureGate'

vi.mock('@/store/uiStore')
vi.mock('@/hooks/usePermissions')
vi.mock('@/hooks/useFeatureGate')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

const mockUiState = {
  sidebarOpen: true,
  darkMode: false,
  toggleSidebar: vi.fn(),
  toggleDarkMode: vi.fn(),
  language: 'es' as const,
  setLanguage: vi.fn(),
}

function renderSidebar() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useUiStore).mockImplementation((selector?: any) =>
      typeof selector === 'function' ? selector(mockUiState) : mockUiState,
    )
  })

  it('renders all sections when full permissions and features', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: () => true,
      hasRole: () => false,
      isOwner: false,
      isAdmin: true,
      getPrimaryRole: () => 'Owner',
      getRoleColor: () => '#dc2626',
      tenant: null,
    })
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })

    renderSidebar()

    // Section headers
    expect(screen.getByText('GENERAL')).toBeInTheDocument()
    expect(screen.getByText('PRODUCTIVIDAD')).toBeInTheDocument()
    expect(screen.getByText('DEVOPS')).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
    expect(screen.getByText('CUENTA')).toBeInTheDocument()

    // Some items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Tareas')).toBeInTheDocument()
    expect(screen.getByText('Variables de Entorno')).toBeInTheDocument()
    expect(screen.getByText('Log de Auditoría')).toBeInTheDocument()
    expect(screen.getByText('Reportes')).toBeInTheDocument()
  })

  it('hides item with feature gate when hasFeature returns false (Variables de Entorno not shown)', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: () => true,
      hasRole: () => false,
      isOwner: false,
      isAdmin: true,
      getPrimaryRole: () => 'Member',
      getRoleColor: () => '#2563eb',
      tenant: null,
    })
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: (feature: string) => feature !== 'env_vars',
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })

    renderSidebar()

    expect(screen.queryByText('Variables de Entorno')).not.toBeInTheDocument()
    // Other devops items still visible
    expect(screen.getByText('Proyectos')).toBeInTheDocument()
  })

  it('hides item with permission when hasPermission returns false (Log de Auditoría not shown)', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: (perm: string) => perm !== 'audit.view_auditlog',
      hasRole: () => false,
      isOwner: false,
      isAdmin: false,
      getPrimaryRole: () => 'Member',
      getRoleColor: () => '#2563eb',
      tenant: null,
    })
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })

    renderSidebar()

    expect(screen.queryByText('Log de Auditoría')).not.toBeInTheDocument()
    // Other admin items still visible (they have permission: null)
    expect(screen.getByText('Compartido')).toBeInTheDocument()
  })

  it('shows upgrade CTA when plan is free', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: () => true,
      hasRole: () => false,
      isOwner: false,
      isAdmin: false,
      getPrimaryRole: () => 'Member',
      getRoleColor: () => '#2563eb',
      tenant: null,
    })
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => false,
      getLimit: () => null,
      plan: 'free',
      isLoading: false,
    })

    renderSidebar()

    expect(screen.getByText('Mejora tu plan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ver planes/i })).toBeInTheDocument()
  })

  it('hides upgrade CTA when plan is professional', () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: () => true,
      hasRole: () => false,
      isOwner: false,
      isAdmin: true,
      getPrimaryRole: () => 'Owner',
      getRoleColor: () => '#dc2626',
      tenant: null,
    })
    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })

    renderSidebar()

    expect(screen.queryByText('Mejora tu plan')).not.toBeInTheDocument()
  })
})
