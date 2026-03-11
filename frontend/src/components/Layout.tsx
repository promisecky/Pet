import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, PawPrint, Activity, Settings } from 'lucide-react'
import { clsx } from 'clsx'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  // Define routes where nav should be hidden (like login)
  if (location.pathname === '/login') {
    return <main className="h-screen bg-background p-4">{children}</main>
  }

  const navItems = [
    { icon: Home, label: '仪表盘', path: '/' },
    { icon: Activity, label: '计划', path: '/plans' },
    { icon: Settings, label: '设备', path: '/devices' },
    { icon: PawPrint, label: '宠物', path: '/pets' },
  ]

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {children}
      </main>
      
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full transition-colors",
                  isActive ? "text-primary" : "text-gray-400 hover:text-primary/70"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={clsx("text-[10px] mt-1 font-medium", isActive ? "text-primary" : "text-gray-400")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
