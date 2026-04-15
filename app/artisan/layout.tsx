import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArtisanNav } from '@/components/ArtisanNav'

export default async function ArtisanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = session.user as any
  if (user.role !== 'ARTISAN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-[#0D1F3C] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link href="/artisan" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-sm leading-none">RUN Hostel Portal</p>
                <p className="text-gray-400 text-xs">Artisan Dashboard</p>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              <Link
                href="/artisan"
                className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Assigned Tasks
              </Link>
            </nav>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">Artisan</p>
              </div>
              <ArtisanNav userName={user.name} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-[#0D1F3C] text-gray-500 text-center text-xs py-4">
        © 2026 Redeemer's University Nigeria — Hostel Facility Complaint Portal
      </footer>
    </div>
  )
}
