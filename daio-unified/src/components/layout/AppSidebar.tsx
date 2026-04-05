import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Calculator,
  Microscope,
  FileText,
  LayoutTemplate,
  LayoutDashboard,
  Zap,
  Bitcoin,
  FileEdit,
  ShieldEllipsis,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  description: string
}

const salesModules: NavItem[] = [
  { path: '/calculator', label: 'Value Explorer', icon: <Calculator className="w-5 h-5" />, description: 'Der Schmerz' },
  { path: '/strategic-platform', label: 'Strategic Platform', icon: <Microscope className="w-5 h-5" />, description: 'Das Warum' },
  { path: '/sales-blueprint', label: 'Sales Blueprint', icon: <FileText className="w-5 h-5" />, description: 'Business Case' },
  { path: '/template-generator', label: 'Template Generator', icon: <LayoutTemplate className="w-5 h-5" />, description: 'Das Werkzeug' },
  { path: '/portfolio-dashboard', label: 'Continuity Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, description: 'Die Plattform' },
  { path: '/pionierfall-pitch', label: 'Pionierfall Pitch', icon: <Zap className="w-5 h-5" />, description: 'Der Beweis' },
]

const toolModules: NavItem[] = [
  { path: '/vault-protocol', label: 'Vault Protocol', icon: <ShieldEllipsis className="w-5 h-5" />, description: 'Shamir Vault' },
  { path: '/btc-ticker', label: 'BTC Loss Ticker', icon: <Bitcoin className="w-5 h-5" />, description: 'Live-Daten' },
  { path: '/document-rewriter', label: 'Document Rewriter', icon: <FileEdit className="w-5 h-5" />, description: 'Dokumente' },
]

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 border-r bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">DAIO</span>
            <span className="text-xs text-muted-foreground">Back2IQ Platform</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sales Dramaturgy */}
      <nav className="flex-1 overflow-y-auto p-2">
        {!collapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sales Dramaturgy
          </p>
        )}
        <div className="space-y-1">
          {salesModules.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <div className="shrink-0 flex items-center justify-center">
                {!collapsed && (
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mr-1">
                    {index + 1}
                  </span>
                )}
                {item.icon}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{item.label}</span>
                  <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <Separator className="my-3" />

        {!collapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tools
          </p>
        )}
        <div className="space-y-1">
          {toolModules.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <div className="shrink-0">{item.icon}</div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{item.label}</span>
                  <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn('w-full', collapsed ? 'justify-center' : 'justify-start gap-2')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
        </Button>
      </div>
    </aside>
  )
}
