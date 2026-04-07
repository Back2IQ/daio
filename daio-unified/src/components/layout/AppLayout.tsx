import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { ChatWidget } from '../ChatWidget'

export function AppLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AppSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
      <ChatWidget />
    </div>
  )
}
