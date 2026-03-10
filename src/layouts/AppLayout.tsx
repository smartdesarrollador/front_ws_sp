import { Outlet } from 'react-router-dom'
import { useUiStore } from '@/store/uiStore'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useUiStore()

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
