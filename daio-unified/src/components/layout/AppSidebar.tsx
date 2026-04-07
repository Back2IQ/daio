import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Calculator,
  Microscope,
  LayoutTemplate,
  LayoutDashboard,
  Bitcoin,
  FileEdit,
  ShieldEllipsis,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  Menu,
} from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  description: string
}

const salesModules: NavItem[] = [
  { path: '/calculator', label: 'Value Explorer', icon: <Calculator className="w-5 h-5" />, description: 'The Pain' },
  { path: '/strategic-platform', label: 'Strategic Platform', icon: <Microscope className="w-5 h-5" />, description: 'The Why' },
  { path: '/template-generator', label: 'Template Generator', icon: <LayoutTemplate className="w-5 h-5" />, description: 'The Tool' },
  { path: '/portfolio-dashboard', label: 'Continuity Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, description: 'The Platform' },
]

const toolModules: NavItem[] = [
  { path: '/vault-protocol', label: 'Vault Protocol', icon: <ShieldEllipsis className="w-5 h-5" />, description: 'Shamir Vault' },
  { path: '/digital-estate', label: 'Digital Estate', icon: <Bitcoin className="w-5 h-5" />, description: 'Inventory & Risk' },
  { path: '/document-rewriter', label: 'Document Rewriter', icon: <FileEdit className="w-5 h-5" />, description: 'Documents' },
]

// ── Shared nav content ───────────────────────────────────────────

function NavContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { theme, setTheme } = useTheme()

  return (
    <>
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
              onClick={onNavigate}
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
                  <span className="truncate text-[#c9a54e]">{item.label}</span>
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
              onClick={onNavigate}
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
                  <span className="truncate text-[#c9a54e]">{item.label}</span>
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
    </>
  )
}

// ── Desktop sidebar ──────────────────────────────────────────────

function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 border-r bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-[#c9a54e]">DAIO</span>
            <span className="text-xs text-muted-foreground">Ahead by Design</span>
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
      <NavContent collapsed={collapsed} />
    </aside>
  )
}

// ── Mobile header + sheet ────────────────────────────────────────

function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Find current module label
  const allModules = [...salesModules, ...toolModules]
  const current = allModules.find((m) => location.pathname.startsWith(m.path))

  return (
    <div className="md:hidden sticky top-0 z-40 bg-sidebar border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <span className="font-bold text-lg tracking-tight text-[#c9a54e]">DAIO</span>
                  <p className="text-xs text-muted-foreground">Ahead by Design</p>
                </div>
                <NavContent onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <span className="font-bold text-sm text-[#c9a54e]">{current?.label || 'DAIO'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────

export function AppSidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  )
}
