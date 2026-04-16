import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppNavigation } from '@/components/AppNavigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = session.user as any
  if (user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col font-sans text-slate-800 pb-[68px] md:pb-0">
      
      {/* Universal Top Header */}
      <header className="sticky top-0 z-[100] w-full bg-[#0D1F3C] shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none tracking-wide">RUN Hostel</p>
              <p className="text-blue-200 font-medium text-[10px] uppercase tracking-wider mt-0.5">Admin Portal</p>
            </div>
          </Link>

          {/* Nav */}
          <AppNavigation role="ADMIN" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 flex flex-col min-w-0">
        {children}
      </main>

      <footer className="hidden md:block w-full py-8 text-center bg-white border-t border-gray-200 mt-auto">
        <p className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} Redeemer's University — Admin Portal
        </p>
      </footer>
    </div>
  )
}

