'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export type NavRole = 'STUDENT' | 'ADMIN' | 'ARTISAN'

export function AppNavigation({ role }: { role: NavRole }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const tabs = {
    STUDENT: [
      { id: '1', label: 'Home', href: '/dashboard', icon: 'fa-house' },
      { id: '2', label: 'Complaints', href: '/dashboard/complaints', icon: 'fa-clipboard-list' },
      { id: '3', label: 'Submit', href: '/dashboard/complaints/new', icon: 'fa-plus', isFab: true },
      { id: '4', label: 'Profile', href: '/dashboard/profile', icon: 'fa-user' },
    ],
    ADMIN: [
      { id: '1', label: 'Overview', href: '/admin', icon: 'fa-chart-pie' },
      { id: '2', label: 'Complaints', href: '/admin/complaints', icon: 'fa-clipboard-list' },
      { id: '3', label: 'Artisans', href: '/admin/artisans', icon: 'fa-hard-hat' },
      { id: '4', label: 'Settings', href: '#', icon: 'fa-gear', action: 'logout' },
    ],
    ARTISAN: [
      { id: '1', label: 'Tasks', href: '/artisan', icon: 'fa-wrench' },
      { id: '2', label: 'Profile', href: '#', icon: 'fa-user', action: 'logout' },
    ],
  }[role]

  const handleAction = (action?: string) => {
    if (action === 'logout') {
      signOut({ callbackUrl: '/login' })
    }
  }

  // To prevent hydration warnings with Next.js pathnames running during initial render
  if (!mounted) return <div className="hidden min-h-[48px]" />

  // Mobile Bottom Nav
  const mobileNav = (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-[60] h-[68px] flex items-end justify-around px-2 shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.08)] pb-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (pathname.startsWith(tab.href + '/') && tab.href !== '/dashboard' && tab.href !== '/admin')

        if (tab.isFab) {
          return (
            <div key={tab.id} className="relative w-[4.5rem] flex justify-center h-full">
               <Link
                  href={tab.href}
                  className="absolute -top-6 w-[3.75rem] h-[3.75rem] bg-amber-500 rounded-full flex flex-col items-center justify-center text-white shadow-xl border-4 border-slate-50 transition-transform active:scale-95"
               >
                 <i className={`fa-solid ${tab.icon} text-xl mb-0.5`} />
                 <span className="text-[10px] font-bold tracking-tight">Submit</span>
               </Link>
            </div>
          )
        }

        if (tab.action) {
           return (
             <button
                key={tab.id}
                onClick={() => handleAction(tab.action)}
                className="flex flex-col items-center justify-center w-full h-[60px] gap-1 transition-colors group"
             >
                <i className={`fa-solid ${tab.icon} text-xl text-gray-400`} />
                <span className="text-[10px] font-medium text-gray-500">{tab.label === 'Settings' || tab.label === 'Profile' ? 'Logout' : tab.label}</span>
             </button>
           )
        }

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center w-full h-[60px] gap-1 transition-colors ${
              isActive ? 'text-[#0D1F3C]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5' : ''}`}>
               <i className={`fa-solid ${tab.icon} text-xl`} />
            </div>
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  // Desktop Top Nav
  const desktopNav = (
    <nav className="hidden md:flex items-center gap-1.5 ml-auto">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (pathname.startsWith(tab.href + '/') && tab.href !== '/dashboard' && tab.href !== '/admin')

        if (tab.isFab) {
           return (
             <Link
               key={tab.id}
               href={tab.href}
               className="ml-4 bg-amber-500 text-white min-h-[48px] px-6 rounded-full flex items-center justify-center gap-2 font-semibold shadow-md hover:bg-amber-600 transition-colors"
             >
               <i className={`fa-solid ${tab.icon}`} />
               {tab.label}
             </Link>
           )
        }

        if (tab.action) {
           return (
             <button
               key={tab.id}
               onClick={() => handleAction(tab.action)}
               className="ml-2 min-h-[48px] px-4 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
             >
               <i className={`fa-solid fa-power-off`} />
               Logout
             </button>
           )
        }

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`min-h-[48px] px-4 rounded-xl flex items-center justify-center text-sm transition-colors ${
              isActive 
                ? 'bg-white/20 text-white font-bold tracking-wide' 
                : 'text-blue-100 hover:bg-white/10 hover:text-white font-medium'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  )
}
