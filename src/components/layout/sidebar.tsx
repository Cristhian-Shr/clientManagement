"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  Package,
  LogOut,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Serviços", href: "/services", icon: Package },
  { name: "Pagamentos", href: "/payments", icon: CreditCard },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col" style={{ 
      backgroundColor: 'var(--sidebar-bg)', 
      borderRight: '1px solid var(--sidebar-border)' 
    }}>
      <div className="flex h-16 items-center justify-center border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Cliente Management</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={{
                backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
              }}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "group-hover:text-white"
                )}
                style={{ color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t p-4 space-y-2" style={{ borderColor: 'var(--sidebar-border)' }}>
        {user && (
          <div className="px-2 py-1 text-sm" style={{ color: 'var(--sidebar-text)' }}>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs opacity-75">{user.email}</p>
          </div>
        )}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          style={{ color: 'var(--sidebar-text)' }}
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}
