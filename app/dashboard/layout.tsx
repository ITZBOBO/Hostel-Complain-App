import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppNavigation } from '@/components/AppNavigation'
import { db } from '@/lib/db'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const sessionUser = session.user as any
  if (!sessionUser.id && !sessionUser.email) redirect('/login')

  const user = await db.user.findFirst({
    where: sessionUser.id
      ? { id: sessionUser.id }
      : { email: sessionUser.email },
  })

  if (!user) redirect('/login')

  return (
    // Clean, modern soft background
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 pb-[68px] md:pb-0">
      
      {/* Modern Deep Blue Header */}
      <header className="sticky top-0 z-[100] w-full bg-[#0D1F3C] shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          
          {/* Brand / Logo */}
          <Link href="/dashboard" className="flex items-center gap-1.5 md:gap-3 group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="bg-white/95 p-1 rounded-full flex items-center justify-center shadow-md">
              <img 
                src="/redeemers-logo.png" 
                alt="Redeemer's University" 
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center text-left">
              <h1 
                className="font-black text-white leading-none tracking-wider text-lg sm:text-xl m-0" 
                style={{ 
                  fontFamily: '"Impact", "Arial Black", sans-serif',
                  textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                REDEEMER&apos;S
              </h1>
              <h1 
                className="font-black text-white leading-none tracking-[0.16em] text-[0.85rem] sm:text-[0.95rem] m-0 mt-0.5" 
                style={{ 
                  fontFamily: '"Impact", "Arial Black", sans-serif',
                  textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                UNIVERSITY
              </h1>
            </div>
          </Link>

          {/* Desktop/Mobile Universal Navigation */}
          <AppNavigation role="STUDENT" />
        </div>
      </header>

      {/* Main Content Area (Full Width) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 flex flex-col min-w-0">
        {children}
      </main>

      {/* Clean Footer (Only visible on Desktop, flows naturally) */}
      <footer className="hidden md:block w-full py-8 text-center bg-white border-t border-slate-200/60 mt-auto">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Redeemer's University. Designed for Hostel Services.
        </p>
      </footer>
    </div>
  )
}

