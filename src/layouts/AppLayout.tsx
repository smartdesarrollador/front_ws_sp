import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const tenant = useAuthStore((s) => s.tenant)

  useEffect(() => {
    if (!tenant?.favicon_url) return
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = tenant.favicon_url
  }, [tenant?.favicon_url])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          data-testid="mobile-overlay"
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
