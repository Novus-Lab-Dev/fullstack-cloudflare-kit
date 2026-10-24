import { useState } from 'react'

import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Settings,
  Users,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'

/** Single source of truth for sidebar entries — mirrors the files in `routes/_authenticated/`. */
const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Messages', to: '/messages', icon: Send },
  { label: 'Templates', to: '/templates', icon: FileText },
  { label: 'Contacts', to: '/contacts', icon: Users },
  { label: 'Settings', to: '/settings', icon: Settings },
] as const

export function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  )

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 md:flex',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent
          collapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((value) => !value)}
        />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface shadow-xl"
          >
            <SidebarContent onNavigate={() => setIsMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu />
          </Button>
          <h1 className="min-w-0 truncate text-sm font-semibold">
            {activeItem?.label ?? 'Console'}
          </h1>
          <UserBadges />
        </header>

        <main className="flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}

function SidebarContent({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: SidebarContentProps) {
  const { user, logout } = useAuth()

  return (
    <>
      <div
        className={cn(
          'flex h-14 shrink-0 items-center gap-2 border-b border-border px-3',
          collapsed && 'justify-center px-0',
        )}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2"
          aria-label="SMS Console"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Send className="size-4" />
          </span>
          {!collapsed ? (
            <span className="truncate text-sm font-semibold">SMS Console</span>
          ) : null}
        </Link>

        {!collapsed ? (
          onToggleCollapse ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto"
              aria-label="Collapse sidebar"
              onClick={onToggleCollapse}
            >
              <PanelLeftClose />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto"
              aria-label="Close navigation"
              onClick={onNavigate}
            >
              <X />
            </Button>
          )
        ) : null}
      </div>

      {collapsed && onToggleCollapse ? (
        <div className="flex shrink-0 justify-center border-b border-border py-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Expand sidebar"
            title="Expand sidebar"
            onClick={onToggleCollapse}
          >
            <PanelLeftOpen />
          </Button>
        </div>
      ) : null}

      <ScrollArea className="min-h-0 flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={cn(
                'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary data-[status=active]:hover:bg-primary/10',
                collapsed && 'justify-center px-0',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? <span className="truncate">{label}</span> : null}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div
        className={cn(
          'flex shrink-0 items-center gap-2 border-t border-border p-2',
          collapsed && 'flex-col',
        )}
      >
        <div
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground uppercase',
            !collapsed && 'ml-1',
          )}
          aria-hidden
        >
          {(user?.sub ?? '?').slice(0, 2)}
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.sub ?? 'Account'}
            </p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {user?.role ?? 'member'}
            </p>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sign out"
          title="Sign out"
          onClick={logout}
        >
          <LogOut />
        </Button>
      </div>
    </>
  )
}

function UserBadges() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="hidden max-w-48 truncate text-xs text-muted-foreground sm:block">
        {user.sub}
      </span>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
        {user.role}
      </span>
    </div>
  )
}
